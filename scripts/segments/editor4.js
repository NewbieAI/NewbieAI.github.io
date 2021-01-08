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
