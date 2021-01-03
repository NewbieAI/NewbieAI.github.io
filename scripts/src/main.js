"use strict";

/*
Source file for my personal React Site.

This file uses React with JSX and will be compiled with Babel.
If you have not seen markup language in Javascript before, just 
remember that after compilation these markup languages become
class instantiations.

Since the scope of this site is well-defined and unlikely
to change later, I've opted to go with a single .js file
to includes all the React components. If this file exceeds
2000 lines of code at some point, maybe I'll refactor it.

Requires setup.json file in the "resources/JSON/Site/" path
setup.json should have the following structure:

{
    "header": {
        "avatarURL": str,
        "backgrounds": [
            image_src1,
            image_src2,
            ...
        ],
        "announcements": [
            str1,
            str2,
            ...
        ]
    },
    "name": "HOME"
    "nesting_depth": 0,
    "articles": [
        article_src1,
        article_src2,
        ...
    ],
    "children": [
        obj1,
        obj2,
        ...
    ]
}

Objects contained in the "content" array should have
the following nested structure:

{
    "name": str,
    "nesting_depth": int
    "articles": [
        article_src1,
        article_src2,
        ...
    ]
    "childrens": [
        obj1,
        obj2,
        ...
    ]
}

*/ 




// React page
class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPath: [],
        };
        this.navigator = this.navigateTo.bind(this);
    }

    navigateTo(newPath) {
        this.setState({
            currentPath: newPath,
        });
        window.scrollTo(
            {top: 300, left: 0, behavior: "smooth"},
        );
    }

    getPathNames(path) {
        let pathNames = ["Home"];
        let cur = this.props.data;
        for (let index of path) {
            cur = cur.contents[index];
            pathNames.push( cur.name );
        }
        return pathNames;
    }

    getArticleList(path) {
        let cur = this.props.data;
        for (let index of path) {
            cur = cur.contents[index];
        }
        return cur.articles;
    }

    getContentList(path) {
        let cur = this.props.data;
        let contents = cur.contents;
        for (let index of path) {
            cur = cur.contents[index];
            if (cur.contents.length > 0) {
                contents = cur.contents;
            } else {
                return contents.map(child => child.name);
            }
        }
        return contents.map(child => child.name);
    }

    getNodeName(path) {
        let cur = this.props.data;
        let nodeName = cur.name;
        for (let index of path) {
            cur = cur.contents[index];
            if (cur.contents.length == 0) {
                return nodeName;
            } else {
                nodeName = cur.name;
            }
        }
        return nodeName;
    }
    
    isLeafNode(path) {
        let cur = this.props.data;
        for (let index of path) {
            cur = cur.contents[index];
        }
        return cur.contents.length == 0;
    }

    render() {
        return (
            <div id = "personal-site">
                <WelcomeHeader {...(this.props.data.header)} />
                <NavigationMenu 
                    navigator = {this.navigator}
                    path = {this.state.currentPath}
                    nodeName = {
                        this.getNodeName(this.state.currentPath)
                    }
                    contentList = {
                        this.getContentList(this.state.currentPath)
                    }
                    isLeafNode = {
                        this.isLeafNode(this.state.currentPath)
                    } />
                <ContentArea 
                    navigator = {this.navigator}
                    path = {this.state.currentPath}
                    pathNames = {
                        this.getPathNames(this.state.currentPath)
                    }
                    articleList = {
                        this.getArticleList(this.state.currentPath)
                    } 
                    fillers = {this.props.globalFillers} />
            </div>
        );
    }
}

class WelcomeHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            newIndex: null,
            isMessaging: false,
            wasMessaging: false,
            message: "",
            messageStatus: "idle",
        };
        this.startSlider = this.startSlider.bind(this);
        this.toggleMessage = this.toggleMessage.bind(this)
        this.selectView = this.selectView.bind(this);
        this.editMessage = this.editMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.cancelMessage = this.cancelMessage.bind(this);
    }

    startSlider() {
        this.setState(
            state => {
                if (state.newIndex == undefined) {
                    return {
                        index: state.index,
                        newIndex: state.index + 1,
                        wasMessaging: false,
                    };
                }
                return {
                    index: state.index + 1,
                    newIndex: state.newIndex + 1,
                    wasMessaging: false,
                };
            }
        );
        this.sliderIntervalID = setInterval(
            () => {
                this.setState(
                    state => ({
                        index: state.index + 1,
                        newIndex: state.newIndex + 1,
                        wasMessaging: false,
                    })
                );
            },
            15000,
        );
    }

    componentDidMount() {
        this.sliderTimeoutID = setTimeout(
            this.startSlider,
            12000,
        );
    }

    componentWillDismount() {
        clearInterval(this.sliderIntervalID);
        clearTimeout(this.sliderTimeoutID);
    }

    toggleMessage() {
        this.setState(
            state => ({
                isMessaging: !state.isMessaging,
                wasMessaging: state.isMessaging,
            })
        );
    }

    selectView(view) {
        clearInterval(this.sliderIntervalID);
        clearTimeout(this.sliderTimeoutID);
        const M = this.props.announcements.length || 1;
        this.setState(
            state => ({
                index: (
                    state.index + (
                        view >= state.index % M ?
                        view - state.index % M : 
                        M + view - state.index % M
                    )
                ),
                newIndex: null,
            })
        );
        this.sliderTimeoutID = setTimeout(
            this.startSlider,
            30000,
        );
    }

    editMessage(text) {
        this.setState(
            {
                message: text,
                messageStatus: "editing",
            }
        );
    }

    sendMessage(e) {
        e.preventDefault();
        this.setState({messageStatus: "pending"});
        fetch(
            "https://9tsemll1m6.execute-api.us-east-2.amazonaws.com/",
            {
                method: "POST",
                body: this.state.message,
            },
        ).then(
            response => {
                if (response.ok) {
                    this.setState({messageStatus: "success"});
                } else {
                    throw new Error("http status error");
                }
            }
        ).catch(
            e => {
                this.setState({messageStatus: "failure"});
            }
        );
    }

    cancelMessage(e) {
        e.preventDefault();
        this.setState({
            isMessaging: false,
            wasMessaging: true,
            message: "",
            messageStatus: "idle",
        });
    }
    
    renderMyName() {
        return (
            <svg viewBox = "0 0 200 80" id = "my-name">
                <path
                    id = "curve"
                    d = "M0 20 Q100 80,200 20"
                    fill = "transparent"/>
                <text id = "my-name-text">
                    <textPath 
                        xlinkHref = "#curve"
                        text-anchor = "middle"
                        startOffset = "50%">
                        TIAN, MINGZHI
                    </textPath>
                </text>
            </svg>
        );
    }

    renderAnnouncement(fadeOut = false) {
        const M = this.props.announcements.length || 1;
        if (fadeOut) {
            return (
                <p className = "announcement">
                {this.props.announcements[
                    this.state.index % M
                ]}
                </p>
            )
        }
        return (
            <p className = "announcement">
            {this.props.announcements[
                (this.state.newIndex ?? this.state.index) % M
            ]}
            </p>
        );
    }

    renderSelectionBar() {
        const M = this.props.announcements.length || 1;
        if (M < 2) {
            return null;
        }
        return (
            <div id = "selection-bar">
            {this.props.announcements.map(
                (element, index) => {
                    let classList;
                    if ((this.state.newIndex == undefined && 
                        this.state.index % M == index) ||
                        (this.state.newIndex != undefined && 
                        this.state.newIndex % M == index)) {
                        classList = "selected-bar-button"
                    } else {
                        classList = "bar-button"
                    }
                    return (
                        <span 
                            className = {classList}
                            onClick = {
                                () => {
                                    this.selectView(index);
                                }
                            }>
                        </span>
                    );
                }
            )}
            </div>
        );
    }

    render() {
        const M = this.props.backgrounds.length || 1;
        const N = this.props.announcements.length || 1;
        const isStatic = (
            this.state.newIndex == undefined ||
            this.state.isMessaging
        );
        return (
            <div className = "welcome-header">
                <img 
                    key = {
                        "BgKey" + this.state.index}
                    id = {
                        this.state.newIndex == undefined ?
                        "static-background" : "current-background"
                    }
                    className = "header-background"
                    src = {
                        this.props.backgrounds[ this.state.index % M ]
                    } 
                    alt = "background image" />
                {this.state.newIndex &&
                    <img
                        key = {"NextBgKey" + this.state.newIndex}
                        id = "next-background"
                        className = "header-background"
                        src = {
                            this.props.backgrounds[
                                this.state.newIndex % M
                            ]
                        } 
                        alt = "background image" />
                }
                <img 
                    id = "avatar"
                    src = {
                        this.state.isMessaging ?
                        this.props.avatarGifs[ 
                            0 | Math.random() * this.props.avatarGifs.length
                        ] : this.props.avatarImg
                    }
                    alt = "Avatar Image"
                    onClick = {this.toggleMessage} />
                {this.renderMyName()}
                {isStatic || this.state.wasMessaging ?
                    null :
                    <div
                        className = "header-banner"
                        key = {"NBannerKey" + this.state.index}
                        id = "current-banner">
                    {this.renderAnnouncement(true)}
                    </div>
                }
                <div 
                    className = {"header-banner" + (
                        this.state.isMessaging ?
                        " hidden" : ""
                    )}
                    key = {
                        "CBannerKey" + (
                            isStatic ?
                            this.state.index : this.state.newIndex
                        )
                    }
                    id = {
                        isStatic || this.state.wasMessaging ?
                        "static-banner" : "next-banner"
                    }>
                {this.renderAnnouncement()}
                </div>
                <div 
                    className = {"header-banner" + (
                        this.state.isMessaging ? 
                        "" : " hidden"
                    )}
                    id = "message-banner">
                    <MessageForm 
                        message = {this.state.message}
                        messageStatus = {this.state.messageStatus}
                        onChange = {this.editMessage}
                        onSend = {this.sendMessage}
                        onCancel = {this.cancelMessage} />
                </div>
                {this.renderSelectionBar()}
            </div>
        );
    }

}

class MessageForm extends React.Component {
    constructor(props) {
        super(props);
        this.editText = this.editText.bind(this);
    }

    editText(e) {
        this.props.onChange(e.target.value);
    }

    getStatus() {
        switch (this.props.messageStatus) {
            case "idle":
                return "You can leave a direct message here!";
            case "editing":
                return "This message will be delivered to my Inbox";
            case "pending":
                return "Sending Message...";
            case "success":
                return "Message Sent!!!";
            case "failure":
                return "Failed to Send Message.";
        }
    }

    render() {
        const maxLength = 1000;
        return (
            <form id = "message-form">
                <textarea
                    id = "message-textarea"
                    value = {this.props.message}
                    placeholder = "[Enter Message Here] (Please provide your contact information if you want a response)"
                    maxlength = {maxLength}
                    onChange = {this.editText}>
                </textarea>
                <button
                    className = "form-button"
                    id = "message-sendbutton"
                    onClick = {this.props.onSend}>
                Send
                </button>
                <button
                    className = "form-button"
                    id = "message-cancelbutton"
                    onClick = {this.props.onCancel}>
                Cancel
                </button>
                <span 
                    key = {this.props.messageStatus}
                    className = {
                        "message-status " + this.props.messageStatus
                    }>
                {this.getStatus()}
                </span>
                <span 
                    className = {"count" + (
                        this.props.message.length < maxLength ?
                        "" : " maximum"
                    )}>
                {this.props.message.length} / {maxLength}
                </span>
            </form>
        );
    }
}

class NavigationMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className = "navigation-menu">
                <NavigationButton 
                    id = "home-button"
                    type = "icon" 
                    src = "resources/Images/Site/icon_home.png"
                    value = "Home Button"
                    path = {[]}
                    clickHandler = {this.props.navigator} />
                {this.props.nodeName != "__HOME__" && 
                    <NavigationButton 
                        type = "topbutton"
                        value = {this.props.nodeName}
                        path = {
                            this.props.isLeafNode ?
                            this.props.path.slice(
                                0, this.props.path.length - 1
                            )
                            :
                            this.props.path.slice()
                        }
                        isSelected = {!this.props.isLeafNode}
                        clickHandler = {this.props.navigator} />
                }
                {this.props.contentList.map(
                    (content, index) => (
                        <NavigationButton
                            value = {content}
                            type = "subbutton"
                            path = {
                                this.props.isLeafNode?
                                [
                                    ...this.props.path.slice(
                                        0, this.props.path.length - 1
                                    ), 
                                    index,
                                ]
                                :
                                [...this.props.path, index]
                            }
                            isSelected = {
                                this.props.isLeafNode
                                &&
                                index == this.props.path[
                                    this.props.path.length - 1
                                ]
                            }
                            clickHandler = {this.props.navigator} />
                    )
                )}
                {this.props.nodeName != "__HOME__" &&
                    <NavigationButton 
                        id = "back-button"
                        type = "icon"
                        value = "Back Button"
                        src = "resources/Images/Site/icon_back.png"
                        path = {
                            this.props.isLeafNode ?
                            this.props.path.slice(
                                0, this.props.path.length - 2,
                            )
                            :
                            this.props.path.slice(
                                0, this.props.path.length - 1,
                            )
                        }
                        clickHandler = {this.props.navigator} />
                }
            </div>
        );
    }
}

class NavigationButton extends React.Component {
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
    }

    clickHandler() {
        this.props.clickHandler(
            this.props.path
        );
    }

    render() {
        switch (this.props.type) {
            case "icon":
                return (
                    <img
                        id = {this.props.id}
                        src = {this.props.src}
                        alt = {this.props.value} 
                        onClick = {this.clickHandler} />
                );
            case "topbutton":
                return (
                    <h3
                        className = {
                            "navigation-button top " + (
                                this.props.isSelected ? 
                                "selected" : "unselected"
                            )
                        }
                        onClick = {this.clickHandler}>
                    {this.props.value.toUpperCase()}:
                    </h3>
                );
            case "subbutton":
                return (
                    <h3
                        className = {
                            "navigation-button item " + (
                                this.props.isSelected ? 
                                " selected" : " unselected"
                            )
                        }
                        onClick = {this.clickHandler}>
                    <span>
                    {"\u00bb "}
                    </span>
                    {this.props.value}
                    </h3>
                );
            default:
                return null;
        }
    }
}

class ContentArea extends React.Component {
    constructor(props) {
        super(props);
    }

    renderNavigationPath() {
        let navigationPath = ["You're Viewing:   "];
        this.props.pathNames.forEach(
            (name, index) => {
                navigationPath.push(
                    <span
                        onClick = {
                            () => {
                                this.props.navigator(
                                    this.props.path.slice(0, index)
                                );
                            }
                        }>
                    {name}
                    </span>
                );
                if (index + 1 < this.props.pathNames.length) {
                    navigationPath.push("   \u2192   ");
                }
            }
        );
        return (
            <p id = "navigation-path">
            {navigationPath}
            </p>
        )
    }

    render() {
        return (
            <div className = "content-area">
            {this.renderNavigationPath()}
            {this.props.articleList.length == 0 &&
            <img 
                className = "empty-article"
                src = "resources/Images/Site/empty.jpg"
                alt = "image that represents an empty article" />
            }
            {this.props.articleList.map(
                article => (
                    <Article 
                        key = {article}
                        src = {article}
                        navigator = {this.props.navigator}
                        fillers = {this.props.fillers} />
                )
            )}
            </div>
        );
    }
}

class Article extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data : this.props.data};
        this.renderElement = this.renderElement.bind(this);
    }

    componentDidMount() {
        fetch(this.props.src)
            .then( response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("http status error");
                }
            }).then( jsonData => {
                this.setState({data : jsonData});
            })
            .catch(
                err => this.setState({data : err})
            );
    }

    renderTitle(title) {
        if (title == "") {
            return null;
        }
        return <h1 className = "title">{title}</h1>;
    }

    renderAuthors(authors) {
        if (authors.length == 0) {
            return null;
        }
        return (
            <h4 className = "author">
            {authors.map(
                (author, index, arr) => {
                    if (index == 0) {
                        return "by " + author;
                    } else if (index + 1 == arr.length) {
                        return " and " + author;
                    }
                    return " " + author;
                }
            ).join()}
            </h4>
        );
    }

    renderDate(creationDate, lastModified) {
        if (creationDate == "") {
            return null;
        }
        return (
            <h4 className = "date">
            {creationDate} (last edited {lastModified})
            </h4>
        );
    }
    
    renderTextElement(element) {
        function buildParagraph(p) {
            if ( codeMatcher.test(p) ) {
                let codeSrc = p.match(codeMatcher)[1];
                return <Code src = {codeSrc}/>
            }
            let arr = p.split( splitter );
            return (
                <p className = {element.indented ? "indented" : null}>
                {arr.map(
                    s => {
                        if ( linkMatcher.test(s) ) {
                            return buildLink(s);
                        }
                        if ( boldMatcher.test(s) ) {
                            return <b>{s.match(boldMatcher)[1]}</b>;
                        }
                        if ( italicMatcher.test(s) ) {
                            return <i>{s.match(italicMatcher)[1]}</i>;
                        }
                        if ( delMatcher.test(s) ) {
                            return <del>{s.match(delMatcher)[1]}</del>;
                        }
                        if ( insMatcher.test(s) ) {
                            return <ins>{s.match(insMatcher)[1]}</ins>;
                        }
                        if ( supMatcher.test(s) ) {
                            return <sup>{s.match(supMatcher)[1]}</sup>;
                        }
                        if ( subMatcher.test(s) ) {
                            return <sub>{s.match(subMatcher)[1]}</sub>;
                        }
                        if ( inlineMatcher.test(s) ) {
                            return <code>{s.match(inlineMatcher)[1]}</code>;
                        }
                        return s;
                    }
                )}
                </p>
            );
        }

        function buildLink(s) {
            const t = s.slice(1, s.length - 1);
            let link, clicker, target;
            if (element.links[t] == undefined) {
                link = null;
                clicker = (e) => {
                    e.preventDefault();
                    return false;
                };
                target = null;
            } else if ( internalLink.test( element.links[t] ) ) {
                link = null;
                clicker = (e) => {
                    e.preventDefault();
                    let pathString = element.links[t].match(
                        internalLink
                    )[1];
                    let path = (
                        pathString == "" ?
                        [] : pathString.split( /, */ ).map( n => +n )
                    );
                    navigator(path);
                    return false;
                }
                target = null;
            } else {
                link = element.links[t];
                clicker = null;
                target = "_blank";
            }
            return (
                <a
                    href = {link}
                    onClick = {clicker}
                    target = {target}>
                {t}
                </a>
            );
        }

        let paragraphs = element.content.split(/\n+/);
        const splitter = /(\^[\d\s\w]+\^|\^\^[\d\s\w]+\^\^|\*[\d\s\w]+\*|\*\*[\d\s\w]+\*\*|~[\d\s\w]+~|~~[\d\s\w]+~~|<<[^<>]+>>|{[\d\s\w]+})/g;
        const linkMatcher = /^{[\d\s\w]+}$/;
        const boldMatcher = /^\*\*([\d\s\w]+)\*\*$/;
        const italicMatcher = /^\*([\d\s\w]+)\*$/;
        const delMatcher = /^~~([\d\s\w]+)~~$/;
        const insMatcher = /^~([\d\s\w]+)~$/;
        const supMatcher = /^\^([\d\w\s]+)\^$/;
        const subMatcher = /^\^\^([\d\s\w]+)\^\^$/;
        const inlineMatcher = /^<<([^<>]+)>>$/;
        const codeMatcher = /^<(.*)>$/;
        const internalLink = /^internal::(.*)$/;
        const navigator = this.props.navigator;
        return (
            <div className = "text">
            {paragraphs.map( buildParagraph )}
            </div>
        );
    }

    renderImageElement(element) {
        let caption;
        if (element.name || element.caption) {
            const sep = (
                element.name == "" || element.caption == "" ?
                "" : ": "
            );
            caption = (
                <div className = "caption">
                    <span className = "caption-text">
                        <b> {element.name + sep} </b>
                        {element.caption}
                    </span>
                </div>
            );
        } else {
            caption = null;
        }
        return (
            <div 
                className = "image-element" >
                <div className = "image-container">
                    <div className = "figure">
                        <img 
                            width = {element.width || null}
                            height = {element.height || null}
                            src = {element.src}
                            alt = "Image failed to load" />
                    </div>
                    {caption}
                </div>
            </div>
        );
    }

    renderQuoteElement(element) {
        return (
            <div className = "quote">
                <p className = "quote-text">
                    <i>{"\u201c" + element.text + "\u201d"}</i>
                </p>
                <span className = "quote-source">
                {element.src == "" ?  null : "\u2014 " + element.src}
                </span>
            </div>
        );
    }

    renderSubtitleElement(element) {
        return (
            <h3 className = "subtitle">
            {element.text}
            </h3>
        );
    }

    renderPlaceholder(element) {
        switch (this.props.fillers[element.name].filler_type) {
            case "Runnable":
                return (
                    <Runnable 
                        {...this.props.fillers[element.name]} 
                        navigator = {this.props.navigator} />
                )
            default:
                return null;
        }
    }

    renderElement(element) {
        switch (element.type) {
            case "text":
                return this.renderTextElement(element);
            case "image":
                return this.renderImageElement(element);
            case "quote":
                return this.renderQuoteElement(element);
            case "subtitle":
                return this.renderSubtitleElement(element);
            case "placeholder":
                return this.renderPlaceholder(element);
            default:
                return null;
        }
    }

    render() {
        if (this.state.data == undefined) {
            return <LoadIndicator/>;
        } else if (this.state.data instanceof Error) {
            return <ErrorIndicator type = "Article"/>;
        }
        return (
            <div className = "article">
                {this.renderTitle(this.state.data.title)}
                {this.renderAuthors(this.state.data.authors)}
                {this.renderDate(
                    this.state.data.creationDate, 
                    this.state.data.lastModified,
                )}
                {this.state.data.components.map(this.renderElement)}
            </div>
        );
    }

}

class Runnable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isError: false,
            isHidden: true,
        };
        this.hideToggler = this.hideToggler.bind(this);
    }

    getMessage() {
        if (this.state.isLoading) {
            return <b className = "load">LOADING...</b>;
        }
        if (this.state.isError) {
            return <b className = "error">Critical Failure</b>;
        }
        return null;
    }

    clickHandler() {
        this.setState({isLoading: true});
        this.props.loader().
            then( () => {
                this.setState({
                    isLoading: false,
                });
                this.props.runner();
            }).
            catch( err => {
                this.setState(
                    {
                        isLoading: false,
                        isError: true,
                    }
                );
            });
    }

    hideToggler() {
        this.setState(
            state => ({isHidden: !state.isHidden})
        );
    }

    render() {
        return (
            <div 
                className = {"runnable" + 
                    (this.state.isHidden ? "" : " expanded")
                }
                id = {this.props.id}>
                <h4 className = "runnable-title">{this.props.name}</h4>
                <div 
                    className = "runnable-button"
                    onClick = {this.clickHandler.bind(this)}>
                <img 
                    className = "runnable-icon"
                    src = {this.props.iconSource} />
                <span className = "status">
                {this.getMessage()}
                </span>
                </div>
                <br/>
                <LinkEmbedText 
                    src = {this.props.introSource}
                    navigator = {this.props.navigator} />
                <HideToggler 
                    isHidden = {this.state.isHidden}
                    hideToggler = {this.hideToggler} />
            </div>
        );
    }
}

class Code extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            isHidden: true,
        }
        this.hideToggler = this.hideToggler.bind(this);
    }

    hideToggler() {
        this.setState(
            state => ({isHidden: !state.isHidden})
        );
    }

    countLines(str) {
        const lineBreaks = /[\r\n]|\r\n/
        return str.split( lineBreaks ).length;
    }

    componentDidMount() {
        fetch(this.props.src)
            .then( response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error("http status error");
                }
            })
            .then( text => {
                this.setState(
                    {
                        data: text,
                        isHidden: this.countLines(text) > 20
                    }
                );
            })
            .catch( err => {
                this.setState({data: err});
            })
    }

    componentDidUpdate() {
        if (this.state.data == undefined || 
            this.state.data instanceof Error) {
            return;
        }
        let cur = ReactDOM.findDOMNode(this);
        //highlight the <pre><code></code></pre> block
        hljs.highlightBlock( cur.firstChild );
    }

    render() {
        if (this.state.data == undefined) {
            return null;
        }
        if (this.state.data instanceof Error) {
            return <ErrorIndicator type = "Code" />;
        }
        return (
            <div className = {"code" + 
                    (this.state.isHidden ? "" : " expanded")
                }>
                <pre><code>
                {this.state.data}
                </code></pre>
                {this.countLines( this.state.data ) > 20 &&
                <HideToggler 
                    isHidden = {this.state.isHidden}
                    hideToggler = {this.hideToggler} />
                }
            </div>
        );
    }
}

class LinkEmbedText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data: null};
    }

    componentDidMount() {
        if (this.state.data != null) {
            return;
        }
        fetch(this.props.src)
            .then( response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("http status error");
                }
            }).then(
                jsonData => {this.setState({data: jsonData})},
                err => {this.setState({data: err})},
            );
    }

    renderData() {
        function buildLink(s) {
            const t = s.slice(1, s.length - 1);
            let link, clicker, target;
            if (data.links[t] == undefined) {
                link = null;
                clicker = (e) => {
                    e.preventDefault();
                    return false;
                };
                target = null;
            } else if ( internalLink.test( data.links[t] ) ) {
                link = null;
                clicker = (e) => {
                    e.preventDefault();
                    let pathString = data.links[t].match(
                        internalLink
                    )[1];
                    let path = (
                        pathString == "" ?
                        [] : pathString.split( /, */ ).map( n => +n )
                    );
                    navigator(path);
                    return false;
                }
                target = null;
            } else {
                link = data.links[t];
                clicker = null;
                target = "_blank";
            }
            return (
                <a
                    href = {link}
                    onClick = {clicker}
                    target = {target}>
                {t}
                </a>
            );
        }

        const data = this.state.data;
        const internalLink = /^internal::(.*)$/;
        const navigator = this.props.navigator;

        let arr = this.state.data.text.split( /({[^{}]+})/g );
        return (
            <p className = "link-embed-text">
            {arr.map(
                s => {
                    if ( /^{[^{}]+}$/.test(s) ) {
                        const t = s.slice(1, s.length - 1);
                        return buildLink(s);
                    }
                    return s;
                }
            )}
            </p>
        );
    }

    render() {
        if (this.state.data == null) {
            return <LoadIndicator/>;
        } else if (this.state.data instanceof Error) {
            return <ErrorIndicator type = "Text"/>;
        }
        return this.renderData();
    }
}

function HideToggler(props) {
    return (
        <div 
            className = {"hide-toggler" + 
                (props.isHidden ? "" : " show")
            }
            onClick = {props.hideToggler}>
            <b>{props.isHidden ? "Show More" : "Hide"}</b>
        </div>
    )
}

function LoadIndicator(props) {
    // in the future it will be updated to more cool-looking
    // animations
    return (
        <img 
            className = "load-indicator" 
            src = "resources/Images/Site/gif_spinner.gif" />
    );
}

function ErrorIndicator(props) {
    return (
        <div className = "error-indicator">
            <img 
                className = "error-image" 
                src = "resources/Images/Site/gif_error.gif" 
                alt = "picture that indicates an error"/>
            <span className = "error-text">
            {props.type} Not Found
            </span>
        </div>
    );
}

const fillers = {
    Cartpole: {
        filler_type: "Runnable",
        id: "cartpole",
        name: "Cartpole",
        iconSource: "resources/Images/Cartpole/cartpole.png",
        introSource: "resources/JSON/Site/projects/cartp_intro.json",
        loader: Cartpole.loadAssets,
        runner: () => {
            let game = new Cartpole();
        },
    },
    Minesweeper: {
        filler_type: "Runnable",
        id: "minesweeper",
        name: "Minesweeper",
        className: "gameSample",
        iconSource: "resources/Images/Minesweeper/mine.png",
        introSource: "resources/JSON/Site/projects/minew_intro.json",
        loader: Minesweeper.loadAssets,
        runner: () => {
            let game = new Minesweeper();
        },
    },
    Snake: {
        filler_type: "Runnable",
        id: "snake",
        name: "Snake",
        className: "gameSample",
        iconSource: "resources/Images/Snake/snake.png",
        introSource: "resources/JSON/Site/projects/snake_intro.json",
        loader: Snake.loadAssets,
        runner: () => {
            let game = new Snake();
        },
    },
};

fetch("resources/JSON/Site/setup.json").
    then(
        response => {
            if ( response.ok ) {
                return response.json();
            } else {
                throw new Error("http server error"); 
            }
        }
    ).then(
        jsonData => {
            ReactDOM.render(
                <MainPage 
                    data = {jsonData} 
                    globalFillers = {fillers} />,
                document.getElementById("root"),
            );
        },
        err => {
            ReactDOM.render(
                <MainPage data = {err} />,
                document.getElementById("root"),
            );
        },
    );
