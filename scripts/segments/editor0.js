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
        if ( !confirm("Are you sure? This will permanently delete the selected element.") ) {
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
