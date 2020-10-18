"use strict";

/* defining the structore of javascript objects that
 * stores all the information of an article
 *
 * {
 *   title: string
 *   authors: []
 *   date: string
 *   compoents: [
 *      {component1},
 *      {component2},
 *      ...
 *   ]
 * }
 *
 * supported article component formats:
 *
 * {
 *   type: image,
 *   name: str,
 *   src: str,
 *   caption: str,
 * }
 *
 * {
 *   type: text,
 *   name: str,
 *   content: "str",
 *   links: {
 *     [link1]: [url1],
 *     [link2]: [url2],
 *     ...
 *   }
 * }
 *
 * {
 *   type: subtitle,
 *   name: str,
 *   text: str,
 * }
 *
 * {
 *   type: quote,
 *   name: str,
 *   text: str,
 *   links: {
 *     [link1]: [url1],
 *     [link2]: [url2],
 *     ...
 *   }
 * }
 *
 * {
 *   type: placeholder,
 *   name: str,
 * }
 *
 */

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                title: "[untitled article]",
                authors: [],
                creationDate: new Date().toLocaleDateString(),
                lastModified: new Date().toLocaleString(),
                components: [],
            },
            selected: null,
            isEditing: false,
        };

        this.movedownHandler = this.movedownElement.bind(this);
        this.moveupHandler = this.moveupElement.bind(this);
        this.deleteHandler = this.deleteElement.bind(this);
        this.startEditing = this.editElement.bind(this, true);
        this.stopEditing = this.editElement.bind(this, false);
        this.addHandler = this.addElement.bind(this);
        this.selectionHandler = this.selectElement.bind(this);
        this.uploadHandler = this.upload.bind(this);
        this.downloadHandler = this.download.bind(this);
        this.updateHandler = this.updateElement.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    movedownElement() {
        if (this.state.selected + 1 == this.state.data.components.length) {
            alert("Element is already at the bottom!");
            return;
        }
        this.setState(
            state => {
                let arr = [...state.data.components];
                [arr[state.selected], arr[state.selected + 1]] = [
                    arr[state.selected + 1],
                    arr[state.selected],
                ];
                return {
                    data: {
                        ...state.data,
                        lastModified: new Date().toLocaleString(),
                        components: arr,
                    },
                    selected: state.selected + 1,
                }
            }
        );
    }

    moveupElement() {
        if (this.state.selected == 0) {
            alert("Element is already at the top");
            return;
        }
        this.setState(
            state => {
                let arr = [...state.data.components];
                [arr[state.selected - 1], arr[state.selected]] = [
                    arr[state.selected],
                    arr[state.selected - 1],
                ];
                return {
                    data: {
                        ...state.data,
                        lastModified: new Date().toLocaleString(),
                        components: arr,
                    },
                    selected: state.selected - 1,
                }
            }
        );
    }

    deleteElement() {
        if (this.state.isEditing && 
            !confirm("Are you sure? (element is being edited)")) {
            return;
        }
        this.setState(
            state => ({
                data: {
                    ...state.data,
                    lastModified: new Date().toLocaleString(),
                    components: state.data.components.filter(
                        (element, index) => {
                            return index != state.selected;
                        }
                    ),
                },
                isEditing: false,
                selected: (
                    state.data.components.length == state.selected + 1? 
                    null : state.selected
                ),
            })
        );
    }

    editElement(value) {
        this.setState({
            isEditing: value,
        });
    }

    addElement(type) {
        this.setState(
            state => ({
                data: {
                    ...state.data,
                    lastModified: new Date().toLocaleString(),
                    components: [
                        ...(state.data.components),
                        this.createElement(type),
                    ],
                },
            })
        );
    }

    createElement(type) {
        switch (type) {
            case "image":
                return {
                    type: "image",
                    name: "[unnamed]",
                    width: "",
                    height: "",
                    src: "",
                    caption: "",
                };
            case "text":
                return {
                    type: "text",
                    name: "[unnamed]",
                    content: "[new text]",
                    links: {},
                    indented: false,
                };
            case "subtitle":
                return {
                    type: "subtitle",
                    name: "[unnamed]",
                    text: "[new subtitle]",
                };
            case "quote":
                return {
                    type: "quote",
                    name: "[unnamed]",
                    text: "[quote text]",
                    src: "[quote source]",
                };
            case "placeholder":
                return {
                    type: "placeholder",
                    name: "[unamed]",
                };
        }
    }

    selectElement(selectionID) {
        if (this.state.isEditing && 
            !confirm("Close the current edit?")) {
            return;
        }
        this.setState({
            selected: selectionID,
            isEditing: false,
        });
    }

    updateElement(update) {
        this.setState(update);
    }

    upload() {
        document.getElementById("json-upload").click();
    }

    download() {
        let a = document.createElement("a");
        let file = new Blob(
            [ JSON.stringify(this.state.data, null, 2) ], 
            {type: "text/json"}
        );
        a.href = URL.createObjectURL(file);
        a.download = prompt("save file as: ");
        a.click();
    }

    loadData(e) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
            this.setState({
                data: JSON.parse(e.target.result),
                selected: null,
                isEditing: false,
            });
        }
        reader.readAsText(file);
    }

    grabSelectedData() {
        switch (this.state.selected) {
            case null:
                return null;
            case "title":
                return {
                    type: "title",
                    content: this.state.data.title,
                };
            case "authors":
                return {
                    type: "authors",
                    content: this.state.data.authors,
                }
            case "date":
                return {
                    type: "date",
                    content: this.state.data.creationDate,
                };
            default:
                return this.state.data.components[this.state.selected];
        }
    }
    
    render() {
        return (
            <div className = "editor">
                <input 
                    type = "file" 
                    id = "json-upload" 
                    accept = ".json" 
                    onChange = {this.loadData} />
                <ControlPanel 
                    data = {this.state.data} 
                    selected = {this.state.selected} 
                    isEditing = {this.state.isEditing}
                    selectionHandler = {this.selectionHandler}
                    moveupHandler = {this.moveupHandler}
                    movedownHandler = {this.movedownHandler}
                    deleteHandler = {this.deleteHandler}
                    editHandler = {this.startEditing}
                    addHandler = {this.addHandler}
                    uploadHandler = {this.uploadHandler} 
                    downloadHandler = {this.downloadHandler} />
                <Article 
                    data = {this.state.data} 
                    selected = {this.state.selected} />
                {this.state.isEditing && 
                    <EditingPanel 
                        data = {this.grabSelectedData()} 
                        updateHandler = {this.updateHandler} 
                        closeHandler = {this.stopEditing} />
                }
            </div>
        );
    }
}

class ControlPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    renderElements() {
        return this.props.data.components.map(
            (component, index) => (
                <ControlElement 
                    type = {component.type}
                    selectionID = {index}
                    isSelected = {this.props.selected == index}
                    name = {component.name}
                    clickHandler = {this.props.selectionHandler} />
            )
        );
    }

    render() {
        return (
            <div id = "control-panel">
                <button 
                    type = "button"
                    id = "upload"
                    onClick = {this.props.uploadHandler}>
                Upload
                </button>
                <button 
                    type = "button" 
                    id = "download" 
                    onClick = {this.props.downloadHandler}>
                Download
                </button>
                <br/>
                <ToolBar 
                    moveupHandler = {this.props.moveupHandler}
                    movedownHandler = {this.props.movedownHandler}
                    deleteHandler = {this.props.deleteHandler}
                    editHandler = {this.props.editHandler}
                    isEditing = {this.props.isEditing}
                    isMovable = {/\d+/.test(this.props.selected)}
                    isEnabled = {this.props.selected != null}/>
                <ControlElement 
                    type = "TITLE" 
                    selectionID = "title"
                    isSelected = {this.props.selected == "title"}
                    name = "Main Title" 
                    clickHandler = {this.props.selectionHandler} />
                <ControlElement 
                    type = "AUTHORS" 
                    selectionID = "authors"
                    isSelected = {this.props.selected == "authors"}
                    name = {this.props.data.authors.length + " authors"}
                    clickHandler = {this.props.selectionHandler} />
                <ControlElement 
                    type = "DATE" 
                    selectionID = "date"
                    isSelected = {this.props.selected == "date"}
                    name = {this.props.data.creationDate}
                    clickHandler = {this.props.selectionHandler} />
                {this.renderElements()}
                <InsertionForm onSubmit = {this.props.addHandler}/>
            </div>
        );
    }
}

class ControlElement extends React.Component {
    constructor(props) {
        super(props);
        this.clickHandler = this.click.bind(this);
    }

    click() {
        this.props.clickHandler(this.props.selectionID);
    }

    getClass() {
        return "control " + (
            this.props.isSelected ?
            "selected" : "unselected"
        );
    }

    render() {
        return (
            <h6 className = {this.getClass()} 
                onClick = {this.clickHandler} >
                {this.props.type}: <i>{this.props.name}</i>
            </h6>
        );
    }
}

class ToolBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className = "toolbar">
                <img 
                    className = {
                        this.props.isEnabled && this.props.isMovable ? 
                        "enabled" : "disabled"
                    }
                    src = "resources/Images/Editor/moveup.png" 
                    alt = "move up"
                    onClick = {this.props.moveupHandler} />
                <img 
                    className = {
                        this.props.isEnabled && this.props.isMovable ? 
                        "enabled" : "disabled"
                    }
                    src = "resources/Images/Editor/movedown.png" 
                    alt = "move down"
                    onClick = {this.props.movedownHandler} />
                <img 
                    className = {
                        this.props.isEnabled && this.props.isMovable ? 
                        "enabled" : "disabled"
                    }
                    src = "resources/Images/Editor/delete.png" 
                    alt = "delete"
                    onClick = {this.props.deleteHandler} />
                <img 
                    className = {
                        this.props.isEnabled && !this.props.isEditing ?
                        "enabled" : "disabled"
                    }
                    src = "resources/Images/Editor/edit.png" 
                    alt = "edit"
                    onClick = {this.props.editHandler} />
            </div>
        );
    }
}

class InsertionForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "placeholder",
        };
        this.onChange = this.changeHandler.bind(this);
        this.onSubmit = this.submitHandler.bind(this);
    }

    changeHandler(e) {
        this.setState({value: e.target.value});
    }

    submitHandler(e) {
        e.preventDefault();
        this.props.onSubmit(this.state.value);
    }

    render() {
        return (
            <form className = "insert" onSubmit = {this.onSubmit}>
                <label for = "new-element">
                    Add Component:
                </label>
                <select id = "new-element" onChange = {this.onChange}>
                    <option value = "placeholder" selected> 
                        placeholder
                    </option>
                    <optgroup label = "Available Components">
                        <option value = "image">image</option>
                        <option value = "text">text</option>
                        <option value = "quote">quotation</option>
                        <option value = "subtitle">subtitle</option>
                    </optgroup>
                </select>
                <input 
                    className = "insert"
                    type = "image" 
                    src = "resources/Images/Editor/insert.png" />
            </form>
        );
    }
}

class Code extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
        }
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
                this.setState({data: text});
            })
            .catch( err => {
                this.setState({data: err});
            })
    }

    componentDidUpdate() {
        if (this.state.data != undefined) {
            let cur = ReactDOM.findDOMNode(this);
            hljs.highlightBlock(cur);
        }
    }

    render() {
        if (this.state.data == undefined) {
            return null;
        }
        if (this.state.data instanceof Error) {
            return null;
        }
        return (
            <pre><code>
            {this.state.data}
            </code></pre>
        );
    }
}

class Article extends React.Component {
    constructor(props) {
        super(props);
        this.renderElement = this.renderElement.bind(this);
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
            let arr = p.split( linkSplitter );
            return (
                <p className = {element.indented ? "indented" : null}>
                {arr.map(
                    s => {
                        if ( linkMatcher.test(s) ) {
                            return buildLink(s);
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
                link = "#";
                clicker = () => {
                    return false;
                };
                target = null;
            } else if ( internalLink.test( element.links[t] ) ) {
                link  = "#";
                clicker = () => {
                    let pathString = element.links[t].match(
                        internalLink
                    )[1];
                    alert("internal link: " + pathString);
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
                    target = {target} >
                {t}
                </a>
            );
        }

        let paragraphs = element.content.split(/\n+/);
        const linkSplitter = /({[^{}]+})/g;
        const linkMatcher = /^{[^{}]+}$/;
        const codeMatcher = /^<(.*)>$/;
        const internalLink = /^internal::(.*)$/;
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
                (element.name == "" || element.caption == "") ?
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
            default:
                return null;
        }
    }

    render() {
        return (
            <div id = "article">
                {this.renderTitle(this.props.data.title)}
                {this.renderAuthors(this.props.data.authors)}
                {this.renderDate(
                    this.props.data.creationDate, 
                    this.props.data.lastModified,
                )}
                {this.props.data.components.map(this.renderElement)}
            </div>
        );
    }
}

class EditingPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            isMinimized: false,
        };
        this.minimizeToggler = this.minimizeToggler.bind(this);
    }

    minimizeToggler() {
        this.setState(
            state => ({isMinimized: !state.isMinimized})
        );
    }

    renderComponentEditor() {
        switch (this.props.data.type) {
            case "title":
                return (
                    <TitleEditor 
                        updateHandler = {this.props.updateHandler}
                        data = {this.props.data} 
                        isMinimized = {this.state.isMinimized} />
                );
            case "authors":
                return (
                    <AuthorEditor 
                        updateHandler = {this.props.updateHandler}
                        data = {this.props.data} 
                        isMinimized = {this.state.isMinimized} />
                );
            case "date":
                return (
                    <DateEditor 
                        updateHandler = {this.props.updateHandler}
                        data = {this.props.data} 
                        isMinimized = {this.state.isMinimized} />
                );
            case "text":
                return (
                    <TextEditor 
                        updateHandler = {this.props.updateHandler}
                        data = {this.props.data}
                        isMinimized = {this.state.isMinimized} />
                );
            case "image":
                return (
                    <ImageEditor 
                        updateHandler = {this.props.updateHandler}
                        data = {this.props.data}
                        isMinimized = {this.state.isMinimized} />
                );
            case "quote":
                return (
                    <QuoteEditor 
                        updateHandler = {this.props.updateHandler}
                        data = {this.props.data}
                        isMinimized = {this.state.isMinimized} />
                );
            case "subtitle":
                return (
                    <SubtitleEditor 
                        updateHandler = {this.props.updateHandler}
                        data = {this.props.data}
                        isMinimized = {this.state.isMinimized} />
                );
            case "placeholder":
                return (
                    <PlaceholderEditor 
                        updateHandler = {this.props.updateHandler}
                        data = {this.props.data}
                        isMinimized = {this.state.isMinimized} />
                );
            default:
                return null;
        }
    }

    render() {
        return (
            <div 
                className = {
                    this.state.isMinimized ? 
                    "is-minimized" : "is-open"
                } 
                id = "editing-panel">
                <StatusBar 
                    isMinimized = {this.state.isMinimized}
                    clickHandler = {this.minimizeToggler} 
                    closeHandler = {this.props.closeHandler} />
                {this.renderComponentEditor()}
                <button 
                    id = "close-button" 
                    className = {
                        this.state.isMinimized ? 
                        "is-minimized" : "is-open"
                    }
                    onClick = {this.props.closeHandler}>
                {
                    this.state.isMinimized ? 
                    <img 
                        id = "close-button-image"
                        src = "resources/Images/editor/close.png"
                        alt = "close" />
                    : "Finish Editing"
                }
                </button>
            </div>
        );
    }
}

class StatusBar extends React.Component {
    constructor(props) {
        super(props);
    }

    getStatusMessage() {
        if (this.props.isMinimized) {
            return "return to editing";
        }
        return "minimize panel";
    }

    render() {
        return (
            <h5 
                className = "status-bar" 
                onClick = {this.props.clickHandler}>
            ----- {this.getStatusMessage()} -----
            </h5>
        );
    }
}

class TitleEditor extends React.Component {
    constructor(props) {
        super(props);
        this.updateTitle = this.updateTitle.bind(this);
    }

    updateTitle(e) {
        const newTitle = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    title: newTitle,
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    render() {
        if (this.props.isMinimized) {
            return null;
        }
        return (
            <div id = "title-editor" className = "component-editor">
                <LabelInGrid 
                    for = "title-textfield" 
                    value = "Edit Title:"/>
                <TextfieldInGrid 
                    ID = "title-textfield" 
                    value = {this.props.data.content} 
                    onChange = {this.updateTitle}/>
            </div>
        );
    }
}

class AuthorEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: null,
        }
        this.selectAuthor = this.selectAuthor.bind(this);
        this.editAuthor = this.editAuthor.bind(this);
        this.addAuthor = this.addAuthor.bind(this);
        this.removeAuthor = this.removeAuthor.bind(this);
    }

    selectAuthor(index) {
        this.setState({selected: index});
    }

    editAuthor(e) {
        const authorName = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    authors: this.props.data.content.map(
                        (author, index) => {
                            if (index == this.state.selected) {
                                return authorName;
                            }
                            return author;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    addAuthor() {
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    authors: [
                        ...this.props.data.content, 
                        "new author"
                    ],
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    removeAuthor() {
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    authors: this.props.data.content.filter(
                        (author, index) => {
                            return index != this.state.selected;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
        this.setState({selected: null});
    }

    render() {
        if (this.props.isMinimized) {
            return null;
        }
        return (
            <div id = "author-editor" className = "component-editor">
                <LabelInGrid 
                    for = "author-list" 
                    value = "Author List: " />
                <div id = "author-list-cell">
                    <ol id = "author-list">
                    {this.props.data.content.map(
                        (authorName, index) => {
                            return (
                                <li 
                                    className = {
                                        this.state.selected == index ?
                                        "selected" : "unselected"
                                    } 
                                    key = {index + authorName} 
                                    onClick = {
                                        () => {
                                            this.selectAuthor(index)
                                        }
                                    }>
                                {authorName}
                                </li>
                            );
                        }
                    )}
                    </ol>
                </div>
                <ButtonInGrid 
                    ID = "author-delete"
                    className = {
                        this.state.selected == null ?
                        "disabled" : "enabled"
                    }
                    value = "Remove Author"
                    onClick = {this.removeAuthor} />
                <ButtonInGrid
                    ID = "author-add"
                    className = "enabled"
                    value = "Add Author"
                    onClick = {this.addAuthor} />
                <LabelInGrid
                    for = "author-textfield"
                    value = "Author Name:" />
                <TextfieldInGrid
                    ID = "author-textfield"
                    className = {
                        this.state.selected == null ?
                        "disabled" : "enabled"
                    }
                    value = {
                        this.state.selected == null ?
                        "" : this.props.data.content[this.state.selected]
                    }
                    onChange = {this.editAuthor} />
            </div>
        );
    }
}

class DateEditor extends React.Component {
    constructor(props) {
        super(props);
        this.updateDate = this.updateDate.bind(this);
    }

    updateDate(e) {
        const newDate = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    creationDate: newDate,
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    render() {
        if (this.props.isMinimized) {
            return null;
        }
        return (
            <div id = "date-editor" className = "component-editor">
                <LabelInGrid 
                    for = "date-textfield" 
                    value = "Edit Date:"/>
                <TextfieldInGrid 
                    ID = "date-textfield" 
                    value = {this.props.data.content} 
                    onChange = {this.updateDate}/>
            </div>
        );
    }
}

class QuoteEditor extends React.Component {
    constructor(props) {
        super(props);
        this.updateName = this.updateName.bind(this);
        this.updateSource = this.updateSource.bind(this);
        this.updateText = this.updateText.bind(this);
    }

    updateName(e) {
        const quoteName = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    name: quoteName,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    updateSource(e) {
        const quoteSource = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    src: quoteSource,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    updateText(e) {
        const quoteText = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    text: quoteText,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    render() {
        if (this.props.isMinimized) {
            return null;
        }
        return (
            <div id = "quote-editor" className = "component-editor">
                <LabelInGrid
                    for = "quote-name"
                    value = "Quote Name:" />
                <TextfieldInGrid
                    ID = "quote-name"
                    value = {this.props.data.name}
                    onChange = {this.updateName} />
                <LabelInGrid
                    for = "quote-source"
                    value = "Quote Source:" />
                <TextfieldInGrid
                    ID = "quote-source"
                    value = {this.props.data.src}
                    onChange = {this.updateSource} />
                <LabelInGrid
                    for = "quote-text"
                    value = "Quote Text:" />
                <TextareaInGrid
                    ID = "quote-text"
                    value = {this.props.data.text}
                    onChange = {this.updateText} />
            </div>
        );
    }
}

class ImageEditor extends React.Component {
    constructor(props) {
        super(props);
        this.updateName = this.updateName.bind(this);
        this.updateSource = this.updateSource.bind(this);
        this.updateCaption = this.updateCaption.bind(this);
        this.updateHeight = this.updateHeight.bind(this);
        this.updateWidth = this.updateWidth.bind(this);
    }

    updateName(e) {
        const imageName = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    name: imageName,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    updateSource(e) {
        const imageSource = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    src: imageSource,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    updateCaption(e) {
        const imageCaption = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    caption: imageCaption,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    updateHeight(e) {
        const imageHeight = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    height: imageHeight,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    updateWidth(e) {
        const imageWidth = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    width: imageWidth,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    render() {
        if (this.props.isMinimized) {
            return null;
        }
        return (
            <div id = "image-editor" className = "component-editor">
                <LabelInGrid
                    for = "image-name"
                    value = "Image Name:" />
                <TextfieldInGrid
                    ID = "image-name"
                    value = {this.props.data.name}
                    onChange = {this.updateName} />
                <LabelInGrid
                    for = "image-source"
                    value = "Image Source:" />
                <TextfieldInGrid
                    ID = "image-source"
                    value = {this.props.data.src}
                    onChange = {this.updateSource} />
                <LabelInGrid
                    for = "image-width"
                    value = "Width:" />
                <TextfieldInGrid
                    ID = "image-width"
                    value = {this.props.data.width}
                    onChange = {this.updateWidth} />
                <LabelInGrid
                    for = "image-height"
                    value = "Height:" />
                <TextfieldInGrid
                    ID = "image-height"
                    value = {this.props.data.height}
                    onChange = {this.updateHeight} />
                <LabelInGrid
                    for = "image-caption"
                    value = "Caption Text:" />
                <TextareaInGrid
                    ID = "image-caption"
                    value = {this.props.data.caption}
                    onChange = {this.updateCaption} />
            </div>
        );
    }
}

class TextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: null,
            newlink: "",
        }
        this.updateName = this.updateName.bind(this);
        this.updateContent = this.updateContent.bind(this);
        this.indentToggler = this.indentToggler.bind(this);
        this.selectLink = this.selectLink.bind(this);
        this.addLink = this.addLink.bind(this);
        this.removeLink = this.removeLink.bind(this);
        this.editSource = this.editSource.bind(this);
        this.editNewLink = this.editNewLink.bind(this);
    }

    updateName(e) {
        const textName = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    name: textName,
                                };
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    updateContent(e) {
        const textContent = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    content: textContent,
                                };
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    indentToggler(e) {
        const isIndentOn = e.target.checked
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    indented: isIndentOn,
                                };
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    addLink() {
        const newLink = this.state.newlink;
        const newLinks = Object.assign(
            {},
            this.props.data.links,
            {[newLink]: "internal::"},
        );
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    links: newLinks,
                                };
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    removeLink() {
        const deletedKey = this.state.selected;
        let {
            [deletedKey] : deletedLink, 
            ...newLinks
        } = this.props.data.links;
        this.setState({selected: null});
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    links: newLinks,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    editSource(e) {
        const newSource = e.target.value;
        const selectedLink = this.state.selected;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    links: {
                                        ...this.props.data.links,
                                        [selectedLink]: newSource,
                                    },
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    selectLink(e) {
        if (e.target.value == "--None--") {
            this.setState({selected: null});
        } else {
            this.setState({selected: e.target.value});
        }
    }

    editNewLink(e) {
        this.setState({newlink: e.target.value});
    }


    render() {
        if (this.props.isMinimized) {
            return null;
        }
        return (
            <div id = "text-editor" className = "component-editor">
                <LabelInGrid
                    for = "text-name"
                    value = "Text Name:" />
                <TextfieldInGrid
                    ID = "text-name"
                    value = {this.props.data.name}
                    onChange = {this.updateName} />
                <LabelInGrid
                    for = "text-content"
                    value = "Edit Text Body:" />
                <TextareaInGrid 
                    ID = "text-content"
                    value = {this.props.data.content}
                    onChange = {this.updateContent} />
                <LabelInGrid
                    for = "text-indent"
                    value = "Auto-Indent:" />
                <div id = "text-indent-cell">
                <input
                    id = "text-indent"
                    type = "checkbox"
                    value = {this.props.data.indented} 
                    onChange = {this.indentToggler} /></div>
                <LabelInGrid
                    for = "link-selection"
                    value = "Selected Link:" />
                <div id = "link-selection-cell">
                    <select 
                        id = "link-selection" 
                        onChange = {this.selectLink}>
                        <option selected = {this.state.selected == null}>
                        --None--
                        </option>
                        {Object.keys(this.props.data.links).map(
                            link => (
                                <option>
                                {link}
                                </option>
                            )
                        )}
                    </select>
                </div>
                <ButtonInGrid
                    ID = "link-delete"
                    className = {
                        this.state.selected == null ?
                        "disabled" : "enabled"
                    }
                    value = "Delete This Link"
                    onClick = {this.removeLink} />
                <ButtonInGrid
                    ID = "link-add"
                    className = {
                        this.state.newlink == "" ?
                        "disabled" : "enabled"
                    }
                    value = "Create New Link"
                    onClick = {this.addLink} />
                <LabelInGrid
                    for = "newlink-name"
                    value = "New Link:" />
                <TextfieldInGrid
                    ID = "newlink-name"
                    value = {this.state.newlink}
                    onChange = {this.editNewLink} />
                <LabelInGrid
                    for = "link-source"
                    value = "Edit Source:" />
                <TextfieldInGrid
                    ID = "link-source"
                    className = {
                        this.state.selected == null ?
                        "disabled" : "enabled"
                    }
                    value = {this.props.data.links[this.state.selected]}
                    onChange = {this.editSource} />
            </div>
        );
    }
}

class SubtitleEditor extends React.Component {
    constructor(props) {
        super(props);
        this.updateName = this.updateName.bind(this);
        this.updateText = this.updateText.bind(this);
    }

    updateName(e) {
        const subtitleName = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    name: subtitleName,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    updateText(e) {
        const subtitleText = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    text: subtitleText,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    render() {
        if (this.props.isMinimized) {
            return null;
        }
        return (
            <div id = "subtitle-editor" className = "component-editor">
                <LabelInGrid
                    for = "subtitle-name"
                    value = "Subtitle Name:" />
                <TextfieldInGrid
                    ID = "subtitle-name"
                    value = {this.props.data.name}
                    onChange = {this.updateName} />
                <LabelInGrid
                    for = "subtitle-text"
                    value = "Subtitle Text:" />
                <TextfieldInGrid
                    ID = "subtitle-text"
                    value = {this.props.data.text}
                    onChange = {this.updateText} />
            </div>
        );
    }
}

class PlaceholderEditor extends React.Component {
    constructor(props) {
        super(props);
        this.updateName = this.updateName.bind(this);
    }

    updateName(e) {
        const placeholderName = e.target.value;
        this.props.updateHandler(
            state => ({
                data: {
                    ...state.data,
                    components: state.data.components.map(
                        (component, index) => {
                            if (index == state.selected) {
                                return {
                                    ...this.props.data,
                                    name: placeholderName,
                                }
                            }
                            return component;
                        }
                    ),
                    lastModified: new Date().toLocaleString(),
                }
            })
        );
    }

    render() {
        if (this.props.isMinimized) {
            return null;
        }
        return (
            <div id = "placeholder-editor" className = "component-editor">
                <LabelInGrid
                    for = "placeholder-name"
                    value = "Placeholder Name:" />
                <TextfieldInGrid
                    ID = "placeholder-name"
                    value = {this.props.data.name}
                    onChange = {this.updateName} />
            </div>
        );
    }
}

class ButtonInGrid extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div id = {this.props.id + "-cell"}>
                <button 
                    id = {this.props.ID} 
                    className = {this.props.className || null}
                    onClick = {this.props.onClick}>
                {this.props.value}
                </button>
            </div>
        );
    }
}

class LabelInGrid extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div id = {this.props.for + "-label-cell"}>
                <label
                    id = {this.props.for + "-label"}
                    className = {this.props.className || null}
                    for = {this.props.for}>
                {this.props.value}
                </label>
            </div>
        );
    }
}

class TextfieldInGrid extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div id = {this.props.ID + "-cell"}>
                <input 
                    id = {this.props.ID} 
                    className = {this.props.className || null}
                    type = "text"
                    value = {this.props.value}
                    onChange = {this.props.onChange} />
            </div>
        );
    }
}

class TextareaInGrid extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div id = {this.props.ID + "-cell"}>
                <textarea 
                    id = {this.props.ID} 
                    value = {this.props.value}
                    className = {this.props.className || null}
                    onChange = {this.props.onChange}>
                </textarea>
            </div>
        );
    }
}

ReactDOM.render(
    <Editor />,
    document.getElementById("root"),
);
