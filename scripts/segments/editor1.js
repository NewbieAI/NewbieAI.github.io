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
                Open
                </button>
                <button 
                    type = "button" 
                    id = "download" 
                    onClick = {this.props.downloadHandler}>
                Save
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
