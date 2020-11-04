"use strict";

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        title: "[untitled article]",
        authors: [],
        creationDate: new Date().toLocaleDateString(),
        lastModified: new Date().toLocaleString(),
        components: []
      },
      selected: null,
      isEditing: false
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

    this.setState(state => {
      let arr = [...state.data.components];
      [arr[state.selected], arr[state.selected + 1]] = [arr[state.selected + 1], arr[state.selected]];
      return {
        data: { ...state.data,
          lastModified: new Date().toLocaleString(),
          components: arr
        },
        selected: state.selected + 1
      };
    });
  }

  moveupElement() {
    if (this.state.selected == 0) {
      alert("Element is already at the top");
      return;
    }

    this.setState(state => {
      let arr = [...state.data.components];
      [arr[state.selected - 1], arr[state.selected]] = [arr[state.selected], arr[state.selected - 1]];
      return {
        data: { ...state.data,
          lastModified: new Date().toLocaleString(),
          components: arr
        },
        selected: state.selected - 1
      };
    });
  }

  deleteElement() {
    if (!confirm("Are you sure? This will permanently delete the selected element.")) {
      return;
    }

    this.setState(state => ({
      data: { ...state.data,
        lastModified: new Date().toLocaleString(),
        components: state.data.components.filter((element, index) => {
          return index != state.selected;
        })
      },
      isEditing: false,
      selected: state.data.components.length == state.selected + 1 ? null : state.selected
    }));
  }

  editElement(value) {
    this.setState({
      isEditing: value
    });
  }

  addElement(type) {
    this.setState(state => ({
      data: { ...state.data,
        lastModified: new Date().toLocaleString(),
        components: [...state.data.components, this.createElement(type)]
      }
    }));
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
          caption: ""
        };

      case "text":
        return {
          type: "text",
          name: "[unnamed]",
          content: "[new text]",
          links: {},
          indented: false
        };

      case "subtitle":
        return {
          type: "subtitle",
          name: "[unnamed]",
          text: "[new subtitle]"
        };

      case "quote":
        return {
          type: "quote",
          name: "[unnamed]",
          text: "[quote text]",
          src: "[quote source]"
        };

      case "placeholder":
        return {
          type: "placeholder",
          name: "[unamed]"
        };
    }
  }

  selectElement(selectionID) {
    if (this.state.isEditing && !confirm("Close the current edit?")) {
      return;
    }

    this.setState({
      selected: selectionID,
      isEditing: false
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
    let file = new Blob([JSON.stringify(this.state.data, null, 2)], {
      type: "text/json"
    });
    a.href = URL.createObjectURL(file);
    a.download = prompt("save file as: ");
    a.click();
  }

  loadData(e) {
    let file = e.target.files[0];
    let reader = new FileReader();

    reader.onload = e => {
      this.setState({
        data: JSON.parse(e.target.result),
        selected: null,
        isEditing: false
      });
    };

    reader.readAsText(file);
  }

  grabSelectedData() {
    switch (this.state.selected) {
      case null:
        return null;

      case "title":
        return {
          type: "title",
          content: this.state.data.title
        };

      case "authors":
        return {
          type: "authors",
          content: this.state.data.authors
        };

      case "date":
        return {
          type: "date",
          content: this.state.data.creationDate
        };

      default:
        return this.state.data.components[this.state.selected];
    }
  }

  render() {
    return React.createElement("div", {
      className: "editor"
    }, React.createElement("input", {
      type: "file",
      id: "json-upload",
      accept: ".json",
      onChange: this.loadData
    }), React.createElement(ControlPanel, {
      data: this.state.data,
      selected: this.state.selected,
      isEditing: this.state.isEditing,
      selectionHandler: this.selectionHandler,
      moveupHandler: this.moveupHandler,
      movedownHandler: this.movedownHandler,
      deleteHandler: this.deleteHandler,
      editHandler: this.startEditing,
      addHandler: this.addHandler,
      uploadHandler: this.uploadHandler,
      downloadHandler: this.downloadHandler
    }), React.createElement(Article, {
      data: this.state.data,
      selected: this.state.selected
    }), this.state.isEditing && React.createElement(EditingPanel, {
      data: this.grabSelectedData(),
      updateHandler: this.updateHandler,
      closeHandler: this.stopEditing
    }));
  }

}

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  renderElements() {
    return this.props.data.components.map((component, index) => React.createElement(ControlElement, {
      type: component.type,
      selectionID: index,
      isSelected: this.props.selected == index,
      name: component.name,
      clickHandler: this.props.selectionHandler
    }));
  }

  render() {
    return React.createElement("div", {
      id: "control-panel"
    }, React.createElement("button", {
      type: "button",
      id: "upload",
      onClick: this.props.uploadHandler
    }, "Upload"), React.createElement("button", {
      type: "button",
      id: "download",
      onClick: this.props.downloadHandler
    }, "Download"), React.createElement("br", null), React.createElement(ToolBar, {
      moveupHandler: this.props.moveupHandler,
      movedownHandler: this.props.movedownHandler,
      deleteHandler: this.props.deleteHandler,
      editHandler: this.props.editHandler,
      isEditing: this.props.isEditing,
      isMovable: /\d+/.test(this.props.selected),
      isEnabled: this.props.selected != null
    }), React.createElement(ControlElement, {
      type: "TITLE",
      selectionID: "title",
      isSelected: this.props.selected == "title",
      name: "Main Title",
      clickHandler: this.props.selectionHandler
    }), React.createElement(ControlElement, {
      type: "AUTHORS",
      selectionID: "authors",
      isSelected: this.props.selected == "authors",
      name: this.props.data.authors.length + " authors",
      clickHandler: this.props.selectionHandler
    }), React.createElement(ControlElement, {
      type: "DATE",
      selectionID: "date",
      isSelected: this.props.selected == "date",
      name: this.props.data.creationDate,
      clickHandler: this.props.selectionHandler
    }), this.renderElements(), React.createElement(InsertionForm, {
      onSubmit: this.props.addHandler
    }));
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
    return "control " + (this.props.isSelected ? "selected" : "unselected");
  }

  render() {
    return React.createElement("h6", {
      className: this.getClass(),
      onClick: this.clickHandler
    }, this.props.type, ": ", React.createElement("i", null, this.props.name));
  }

}

class ToolBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return React.createElement("div", {
      className: "toolbar"
    }, React.createElement("img", {
      className: this.props.isEnabled && this.props.isMovable ? "enabled" : "disabled",
      src: "resources/Images/Editor/moveup.png",
      alt: "move up",
      onClick: this.props.moveupHandler
    }), React.createElement("img", {
      className: this.props.isEnabled && this.props.isMovable ? "enabled" : "disabled",
      src: "resources/Images/Editor/movedown.png",
      alt: "move down",
      onClick: this.props.movedownHandler
    }), React.createElement("img", {
      className: this.props.isEnabled && this.props.isMovable ? "enabled" : "disabled",
      src: "resources/Images/Editor/delete.png",
      alt: "delete",
      onClick: this.props.deleteHandler
    }), React.createElement("img", {
      className: this.props.isEnabled && !this.props.isEditing ? "enabled" : "disabled",
      src: "resources/Images/Editor/edit.png",
      alt: "edit",
      onClick: this.props.editHandler
    }));
  }

}

class InsertionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "placeholder"
    };
    this.onChange = this.changeHandler.bind(this);
    this.onSubmit = this.submitHandler.bind(this);
  }

  changeHandler(e) {
    this.setState({
      value: e.target.value
    });
  }

  submitHandler(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.value);
  }

  render() {
    return React.createElement("form", {
      className: "insert",
      onSubmit: this.onSubmit
    }, React.createElement("label", {
      for: "new-element"
    }, "Add Component:"), React.createElement("select", {
      id: "new-element",
      onChange: this.onChange
    }, React.createElement("option", {
      value: "placeholder",
      selected: true
    }, "placeholder"), React.createElement("optgroup", {
      label: "Available Components"
    }, React.createElement("option", {
      value: "image"
    }, "image"), React.createElement("option", {
      value: "text"
    }, "text"), React.createElement("option", {
      value: "quote"
    }, "quotation"), React.createElement("option", {
      value: "subtitle"
    }, "subtitle"))), React.createElement("input", {
      className: "insert",
      type: "image",
      src: "resources/Images/Editor/insert.png"
    }));
  }

}

class Code extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    fetch(this.props.src).then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error("http status error");
      }
    }).then(text => {
      this.setState({
        data: text
      });
    }).catch(err => {
      this.setState({
        data: err
      });
    });
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

    return React.createElement("pre", null, React.createElement("code", null, this.state.data));
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

    return React.createElement("h1", {
      className: "title"
    }, title);
  }

  renderAuthors(authors) {
    if (authors.length == 0) {
      return null;
    }

    return React.createElement("h4", {
      className: "author"
    }, authors.map((author, index, arr) => {
      if (index == 0) {
        return "by " + author;
      } else if (index + 1 == arr.length) {
        return " and " + author;
      }

      return " " + author;
    }).join());
  }

  renderDate(creationDate, lastModified) {
    if (creationDate == "") {
      return null;
    }

    return React.createElement("h4", {
      className: "date"
    }, creationDate, " (last edited ", lastModified, ")");
  }

  renderTextElement(element) {
    function buildParagraph(p) {
      if (codeMatcher.test(p)) {
        let codeSrc = p.match(codeMatcher)[1];
        return React.createElement(Code, {
          src: codeSrc
        });
      }

      let arr = p.split(linkSplitter);
      return React.createElement("p", {
        className: element.indented ? "indented" : null
      }, arr.map(s => {
        if (linkMatcher.test(s)) {
          return buildLink(s);
        }

        return s;
      }));
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
      } else if (internalLink.test(element.links[t])) {
        link = "#";

        clicker = () => {
          let pathString = element.links[t].match(internalLink)[1];
          alert("internal link: " + pathString);
          return false;
        };

        target = null;
      } else {
        link = element.links[t];
        clicker = null;
        target = "_blank";
      }

      return React.createElement("a", {
        href: link,
        onClick: clicker,
        target: target
      }, t);
    }

    let paragraphs = element.content.split(/\n+/);
    const linkSplitter = /({[^{}]+})/g;
    const linkMatcher = /^{[^{}]+}$/;
    const codeMatcher = /^<(.*)>$/;
    const internalLink = /^internal::(.*)$/;
    return React.createElement("div", {
      className: "text"
    }, paragraphs.map(buildParagraph));
  }

  renderImageElement(element) {
    let caption;

    if (element.name || element.caption) {
      const sep = element.name == "" || element.caption == "" ? "" : ": ";
      caption = React.createElement("div", {
        className: "caption"
      }, React.createElement("span", {
        className: "caption-text"
      }, React.createElement("b", null, " ", element.name + sep, " "), element.caption));
    } else {
      caption = null;
    }

    return React.createElement("div", {
      className: "image-element"
    }, React.createElement("div", {
      className: "image-container"
    }, React.createElement("div", {
      className: "figure"
    }, React.createElement("img", {
      width: element.width || null,
      height: element.height || null,
      src: element.src,
      alt: "Image failed to load"
    })), caption));
  }

  renderQuoteElement(element) {
    return React.createElement("div", {
      className: "quote"
    }, React.createElement("p", {
      className: "quote-text"
    }, React.createElement("i", null, "\u201c" + element.text + "\u201d")), React.createElement("span", {
      className: "quote-source"
    }, element.src == "" ? null : "\u2014 " + element.src));
  }

  renderSubtitleElement(element) {
    return React.createElement("h3", {
      className: "subtitle"
    }, element.text);
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
    return React.createElement("div", {
      id: "article"
    }, this.renderTitle(this.props.data.title), this.renderAuthors(this.props.data.authors), this.renderDate(this.props.data.creationDate, this.props.data.lastModified), this.props.data.components.map(this.renderElement));
  }

}

class EditingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      isMinimized: false
    };
    this.minimizeToggler = this.minimizeToggler.bind(this);
  }

  minimizeToggler() {
    this.setState(state => ({
      isMinimized: !state.isMinimized
    }));
  }

  renderComponentEditor() {
    switch (this.props.data.type) {
      case "title":
        return React.createElement(TitleEditor, {
          updateHandler: this.props.updateHandler,
          data: this.props.data,
          isMinimized: this.state.isMinimized
        });

      case "authors":
        return React.createElement(AuthorEditor, {
          updateHandler: this.props.updateHandler,
          data: this.props.data,
          isMinimized: this.state.isMinimized
        });

      case "date":
        return React.createElement(DateEditor, {
          updateHandler: this.props.updateHandler,
          data: this.props.data,
          isMinimized: this.state.isMinimized
        });

      case "text":
        return React.createElement(TextEditor, {
          updateHandler: this.props.updateHandler,
          data: this.props.data,
          isMinimized: this.state.isMinimized
        });

      case "image":
        return React.createElement(ImageEditor, {
          updateHandler: this.props.updateHandler,
          data: this.props.data,
          isMinimized: this.state.isMinimized
        });

      case "quote":
        return React.createElement(QuoteEditor, {
          updateHandler: this.props.updateHandler,
          data: this.props.data,
          isMinimized: this.state.isMinimized
        });

      case "subtitle":
        return React.createElement(SubtitleEditor, {
          updateHandler: this.props.updateHandler,
          data: this.props.data,
          isMinimized: this.state.isMinimized
        });

      case "placeholder":
        return React.createElement(PlaceholderEditor, {
          updateHandler: this.props.updateHandler,
          data: this.props.data,
          isMinimized: this.state.isMinimized
        });

      default:
        return null;
    }
  }

  render() {
    return React.createElement("div", {
      className: this.state.isMinimized ? "is-minimized" : "is-open",
      id: "editing-panel"
    }, React.createElement(StatusBar, {
      isMinimized: this.state.isMinimized,
      clickHandler: this.minimizeToggler,
      closeHandler: this.props.closeHandler
    }), this.renderComponentEditor(), React.createElement("button", {
      id: "close-button",
      className: this.state.isMinimized ? "is-minimized" : "is-open",
      onClick: this.props.closeHandler
    }, this.state.isMinimized ? React.createElement("img", {
      id: "close-button-image",
      src: "resources/Images/editor/close.png",
      alt: "close"
    }) : "Finish Editing"));
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
    return React.createElement("h5", {
      className: "status-bar",
      onClick: this.props.clickHandler
    }, "----- ", this.getStatusMessage(), " -----");
  }

}

class TitleEditor extends React.Component {
  constructor(props) {
    super(props);
    this.updateTitle = this.updateTitle.bind(this);
  }

  updateTitle(e) {
    const newTitle = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        title: newTitle,
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  render() {
    if (this.props.isMinimized) {
      return null;
    }

    return React.createElement("div", {
      id: "title-editor",
      className: "component-editor"
    }, React.createElement(LabelInGrid, {
      for: "title-textfield",
      value: "Edit Title:"
    }), React.createElement(TextfieldInGrid, {
      ID: "title-textfield",
      value: this.props.data.content,
      onChange: this.updateTitle
    }));
  }

}

class AuthorEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null
    };
    this.selectAuthor = this.selectAuthor.bind(this);
    this.editAuthor = this.editAuthor.bind(this);
    this.addAuthor = this.addAuthor.bind(this);
    this.removeAuthor = this.removeAuthor.bind(this);
  }

  selectAuthor(index) {
    this.setState({
      selected: index
    });
  }

  editAuthor(e) {
    const authorName = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        authors: this.props.data.content.map((author, index) => {
          if (index == this.state.selected) {
            return authorName;
          }

          return author;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  addAuthor() {
    this.props.updateHandler(state => ({
      data: { ...state.data,
        authors: [...this.props.data.content, "new author"],
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  removeAuthor() {
    this.props.updateHandler(state => ({
      data: { ...state.data,
        authors: this.props.data.content.filter((author, index) => {
          return index != this.state.selected;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
    this.setState({
      selected: null
    });
  }

  render() {
    if (this.props.isMinimized) {
      return null;
    }

    return React.createElement("div", {
      id: "author-editor",
      className: "component-editor"
    }, React.createElement(LabelInGrid, {
      for: "author-list",
      value: "Author List: "
    }), React.createElement("div", {
      id: "author-list-cell"
    }, React.createElement("ol", {
      id: "author-list"
    }, this.props.data.content.map((authorName, index) => {
      return React.createElement("li", {
        className: this.state.selected == index ? "selected" : "unselected",
        key: index + authorName,
        onClick: () => {
          this.selectAuthor(index);
        }
      }, authorName);
    }))), React.createElement(ButtonInGrid, {
      ID: "author-delete",
      className: this.state.selected == null ? "disabled" : "enabled",
      value: "Remove Author",
      onClick: this.removeAuthor
    }), React.createElement(ButtonInGrid, {
      ID: "author-add",
      className: "enabled",
      value: "Add Author",
      onClick: this.addAuthor
    }), React.createElement(LabelInGrid, {
      for: "author-textfield",
      value: "Author Name:"
    }), React.createElement(TextfieldInGrid, {
      ID: "author-textfield",
      className: this.state.selected == null ? "disabled" : "enabled",
      value: this.state.selected == null ? "" : this.props.data.content[this.state.selected],
      onChange: this.editAuthor
    }));
  }

}

class DateEditor extends React.Component {
  constructor(props) {
    super(props);
    this.updateDate = this.updateDate.bind(this);
  }

  updateDate(e) {
    const newDate = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        creationDate: newDate,
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  render() {
    if (this.props.isMinimized) {
      return null;
    }

    return React.createElement("div", {
      id: "date-editor",
      className: "component-editor"
    }, React.createElement(LabelInGrid, {
      for: "date-textfield",
      value: "Edit Date:"
    }), React.createElement(TextfieldInGrid, {
      ID: "date-textfield",
      value: this.props.data.content,
      onChange: this.updateDate
    }));
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
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              name: quoteName
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  updateSource(e) {
    const quoteSource = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              src: quoteSource
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  updateText(e) {
    const quoteText = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              text: quoteText
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  render() {
    if (this.props.isMinimized) {
      return null;
    }

    return React.createElement("div", {
      id: "quote-editor",
      className: "component-editor"
    }, React.createElement(LabelInGrid, {
      for: "quote-name",
      value: "Quote Name:"
    }), React.createElement(TextfieldInGrid, {
      ID: "quote-name",
      value: this.props.data.name,
      onChange: this.updateName
    }), React.createElement(LabelInGrid, {
      for: "quote-source",
      value: "Quote Source:"
    }), React.createElement(TextfieldInGrid, {
      ID: "quote-source",
      value: this.props.data.src,
      onChange: this.updateSource
    }), React.createElement(LabelInGrid, {
      for: "quote-text",
      value: "Quote Text:"
    }), React.createElement(TextareaInGrid, {
      ID: "quote-text",
      value: this.props.data.text,
      onChange: this.updateText
    }));
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
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              name: imageName
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  updateSource(e) {
    const imageSource = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              src: imageSource
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  updateCaption(e) {
    const imageCaption = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              caption: imageCaption
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  updateHeight(e) {
    const imageHeight = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              height: imageHeight
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  updateWidth(e) {
    const imageWidth = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              width: imageWidth
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  render() {
    if (this.props.isMinimized) {
      return null;
    }

    return React.createElement("div", {
      id: "image-editor",
      className: "component-editor"
    }, React.createElement(LabelInGrid, {
      for: "image-name",
      value: "Image Name:"
    }), React.createElement(TextfieldInGrid, {
      ID: "image-name",
      value: this.props.data.name,
      onChange: this.updateName
    }), React.createElement(LabelInGrid, {
      for: "image-source",
      value: "Image Source:"
    }), React.createElement(TextfieldInGrid, {
      ID: "image-source",
      value: this.props.data.src,
      onChange: this.updateSource
    }), React.createElement(LabelInGrid, {
      for: "image-width",
      value: "Width:"
    }), React.createElement(TextfieldInGrid, {
      ID: "image-width",
      value: this.props.data.width,
      onChange: this.updateWidth
    }), React.createElement(LabelInGrid, {
      for: "image-height",
      value: "Height:"
    }), React.createElement(TextfieldInGrid, {
      ID: "image-height",
      value: this.props.data.height,
      onChange: this.updateHeight
    }), React.createElement(LabelInGrid, {
      for: "image-caption",
      value: "Caption Text:"
    }), React.createElement(TextareaInGrid, {
      ID: "image-caption",
      value: this.props.data.caption,
      onChange: this.updateCaption
    }));
  }

}

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      newlink: ""
    };
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
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              name: textName
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  updateContent(e) {
    const textContent = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              content: textContent
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  indentToggler(e) {
    const isIndentOn = e.target.checked;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              indented: isIndentOn
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  addLink() {
    const newLink = this.state.newlink;
    const newLinks = Object.assign({}, this.props.data.links, {
      [newLink]: "internal::"
    });
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              links: newLinks
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  removeLink() {
    const deletedKey = this.state.selected;
    let {
      [deletedKey]: deletedLink,
      ...newLinks
    } = this.props.data.links;
    this.setState({
      selected: null
    });
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              links: newLinks
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  editSource(e) {
    const newSource = e.target.value;
    const selectedLink = this.state.selected;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              links: { ...this.props.data.links,
                [selectedLink]: newSource
              }
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  selectLink(e) {
    if (e.target.value == "--None--") {
      this.setState({
        selected: null
      });
    } else {
      this.setState({
        selected: e.target.value
      });
    }
  }

  editNewLink(e) {
    this.setState({
      newlink: e.target.value
    });
  }

  render() {
    if (this.props.isMinimized) {
      return null;
    }

    return React.createElement("div", {
      id: "text-editor",
      className: "component-editor"
    }, React.createElement(LabelInGrid, {
      for: "text-name",
      value: "Text Name:"
    }), React.createElement(TextfieldInGrid, {
      ID: "text-name",
      value: this.props.data.name,
      onChange: this.updateName
    }), React.createElement(LabelInGrid, {
      for: "text-content",
      value: "Edit Text Body:"
    }), React.createElement(TextareaInGrid, {
      ID: "text-content",
      value: this.props.data.content,
      onChange: this.updateContent
    }), React.createElement(LabelInGrid, {
      for: "text-indent",
      value: "Auto-Indent:"
    }), React.createElement("div", {
      id: "text-indent-cell"
    }, React.createElement("input", {
      id: "text-indent",
      type: "checkbox",
      value: this.props.data.indented,
      onChange: this.indentToggler
    })), React.createElement(LabelInGrid, {
      for: "link-selection",
      value: "Selected Link:"
    }), React.createElement("div", {
      id: "link-selection-cell"
    }, React.createElement("select", {
      id: "link-selection",
      onChange: this.selectLink
    }, React.createElement("option", {
      selected: this.state.selected == null
    }, "--None--"), Object.keys(this.props.data.links).map(link => React.createElement("option", null, link)))), React.createElement(ButtonInGrid, {
      ID: "link-delete",
      className: this.state.selected == null ? "disabled" : "enabled",
      value: "Delete This Link",
      onClick: this.removeLink
    }), React.createElement(ButtonInGrid, {
      ID: "link-add",
      className: this.state.newlink == "" ? "disabled" : "enabled",
      value: "Create New Link",
      onClick: this.addLink
    }), React.createElement(LabelInGrid, {
      for: "newlink-name",
      value: "New Link:"
    }), React.createElement(TextfieldInGrid, {
      ID: "newlink-name",
      value: this.state.newlink,
      onChange: this.editNewLink
    }), React.createElement(LabelInGrid, {
      for: "link-source",
      value: "Edit Source:"
    }), React.createElement(TextfieldInGrid, {
      ID: "link-source",
      className: this.state.selected == null ? "disabled" : "enabled",
      value: this.props.data.links[this.state.selected],
      onChange: this.editSource
    }));
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
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              name: subtitleName
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  updateText(e) {
    const subtitleText = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              text: subtitleText
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  render() {
    if (this.props.isMinimized) {
      return null;
    }

    return React.createElement("div", {
      id: "subtitle-editor",
      className: "component-editor"
    }, React.createElement(LabelInGrid, {
      for: "subtitle-name",
      value: "Subtitle Name:"
    }), React.createElement(TextfieldInGrid, {
      ID: "subtitle-name",
      value: this.props.data.name,
      onChange: this.updateName
    }), React.createElement(LabelInGrid, {
      for: "subtitle-text",
      value: "Subtitle Text:"
    }), React.createElement(TextfieldInGrid, {
      ID: "subtitle-text",
      value: this.props.data.text,
      onChange: this.updateText
    }));
  }

}

class PlaceholderEditor extends React.Component {
  constructor(props) {
    super(props);
    this.updateName = this.updateName.bind(this);
  }

  updateName(e) {
    const placeholderName = e.target.value;
    this.props.updateHandler(state => ({
      data: { ...state.data,
        components: state.data.components.map((component, index) => {
          if (index == state.selected) {
            return { ...this.props.data,
              name: placeholderName
            };
          }

          return component;
        }),
        lastModified: new Date().toLocaleString()
      }
    }));
  }

  render() {
    if (this.props.isMinimized) {
      return null;
    }

    return React.createElement("div", {
      id: "placeholder-editor",
      className: "component-editor"
    }, React.createElement(LabelInGrid, {
      for: "placeholder-name",
      value: "Placeholder Name:"
    }), React.createElement(TextfieldInGrid, {
      ID: "placeholder-name",
      value: this.props.data.name,
      onChange: this.updateName
    }));
  }

}

class ButtonInGrid extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return React.createElement("div", {
      id: this.props.id + "-cell"
    }, React.createElement("button", {
      id: this.props.ID,
      className: this.props.className || null,
      onClick: this.props.onClick
    }, this.props.value));
  }

}

class LabelInGrid extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return React.createElement("div", {
      id: this.props.for + "-label-cell"
    }, React.createElement("label", {
      id: this.props.for + "-label",
      className: this.props.className || null,
      for: this.props.for
    }, this.props.value));
  }

}

class TextfieldInGrid extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return React.createElement("div", {
      id: this.props.ID + "-cell"
    }, React.createElement("input", {
      id: this.props.ID,
      className: this.props.className || null,
      type: "text",
      value: this.props.value,
      onChange: this.props.onChange
    }));
  }

}

class TextareaInGrid extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return React.createElement("div", {
      id: this.props.ID + "-cell"
    }, React.createElement("textarea", {
      id: this.props.ID,
      value: this.props.value,
      className: this.props.className || null,
      onChange: this.props.onChange
    }));
  }

}

ReactDOM.render(React.createElement(Editor, null), document.getElementById("root"));
