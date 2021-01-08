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
