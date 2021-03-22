"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

class MainPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPath: [...this.props.path],
      isPrivate: false
    };
    this.navigator = this.navigateTo.bind(this);
    this.isPagePrivate = this.isPagePrivate.bind(this);
    this.setPublic = this.setPagePublic.bind(this);
  }

  navigateTo(newPath) {
    this.setState({
      currentPath: newPath,
      isPrivate: this.isPagePrivate(newPath)
    });
    window.scrollTo({
      top: 300,
      left: 0,
      behavior: "smooth"
    });
  }

  getPathNames(path) {
    let pathNames = ["Home"];
    let cur = this.props.data;

    for (let index of path) {
      if (!Array.isArray(cur?.contents) || isNaN(index) || cur.contents.length <= index) {
        pathNames.push("Bad Page");
        return pathNames;
      }

      cur = cur.contents[index];
      pathNames.push(cur.name);
    }

    return pathNames;
  }

  getArticleList(path) {
    let cur = this.props.data;

    for (let index of path) {
      if (!Array.isArray(cur?.contents) || isNaN(index) || cur.contents.length <= index) {
        return [];
      }

      cur = cur.contents[index];
    }

    return cur.articles;
  }

  getContentList(path) {
    let cur = this.props.data;
    let contents = cur.contents;

    for (let index of path) {
      if (!Array.isArray(cur?.contents) || isNaN(index) || cur.contents.length <= index) {
        return [];
      }

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
      if (!Array.isArray(cur?.contents) || isNaN(index) || cur.contents.length <= index) {
        return "__HOME__";
      }

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
      if (!Array.isArray(cur?.contents) || isNaN(index) || cur.contents.length <= index) {
        return true;
      }

      cur = cur.contents[index];
    }

    return cur.contents.length == 0;
  }

  isPagePrivate(path) {
    let cur = this.props.data;

    for (let index of path) {
      if (!Array.isArray(cur?.contents) || isNaN(index) || cur.contents.length <= index) {
        return false;
      }

      cur = cur.contents[index];
    }

    console.log(cur?.isPrivate);
    return cur?.isPrivate;
  }

  setPagePublic() {
    this.setState({
      isPrivate: false
    });
  }

  render() {
    return React.createElement("div", {
      id: "personal-site"
    }, React.createElement(WelcomeHeader, this.props.data.header), React.createElement(NavigationMenu, {
      navigator: this.navigator,
      path: this.state.currentPath,
      nodeName: this.getNodeName(this.state.currentPath),
      contentList: this.getContentList(this.state.currentPath),
      isLeafNode: this.isLeafNode(this.state.currentPath),
      isPagePrivate: this.isPagePrivate
    }), React.createElement(ContentArea, {
      navigator: this.navigator,
      path: this.state.currentPath,
      nodeName: this.getNodeName(this.state.currentPath),
      pathNames: this.getPathNames(this.state.currentPath),
      articleList: this.getArticleList(this.state.currentPath),
      isPrivate: this.state.isPrivate,
      setPublic: this.setPublic,
      fillers: this.props.globalFillers
    }));
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
      messageStatus: "idle"
    };
    this.startSlider = this.startSlider.bind(this);
    this.toggleMessage = this.toggleMessage.bind(this);
    this.selectView = this.selectView.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.cancelMessage = this.cancelMessage.bind(this);
  }

  startSlider() {
    this.setState(state => {
      if (state.newIndex == undefined) {
        return {
          index: state.index,
          newIndex: state.index + 1,
          wasMessaging: false
        };
      }

      return {
        index: state.index + 1,
        newIndex: state.newIndex + 1,
        wasMessaging: false
      };
    });
    this.sliderIntervalID = setInterval(() => {
      this.setState(state => ({
        index: state.index + 1,
        newIndex: state.newIndex + 1,
        wasMessaging: false
      }));
    }, 15000);
  }

  componentDidMount() {
    this.sliderTimeoutID = setTimeout(this.startSlider, 12000);
  }

  componentWillDismount() {
    clearInterval(this.sliderIntervalID);
    clearTimeout(this.sliderTimeoutID);
  }

  toggleMessage() {
    this.setState(state => ({
      isMessaging: !state.isMessaging,
      wasMessaging: state.isMessaging
    }));
  }

  selectView(view) {
    clearInterval(this.sliderIntervalID);
    clearTimeout(this.sliderTimeoutID);
    const M = this.props.announcements.length || 1;
    this.setState(state => ({
      index: state.index + (view >= state.index % M ? view - state.index % M : M + view - state.index % M),
      newIndex: null
    }));
    this.sliderTimeoutID = setTimeout(this.startSlider, 30000);
  }

  editMessage(text) {
    this.setState({
      message: text,
      messageStatus: "editing"
    });
  }

  sendMessage(e) {
    e.preventDefault();
    this.setState({
      messageStatus: "pending"
    });
    fetch("https://9tsemll1m6.execute-api.us-east-2.amazonaws.com/default/sns_message_push", {
      method: "POST",
      body: this.state.message
    }).then(response => {
      if (response.ok) {
        this.setState({
          messageStatus: "success"
        });
      } else {
        throw new Error("http status error");
      }
    }).catch(e => {
      this.setState({
        messageStatus: "failure"
      });
    });
  }

  cancelMessage(e) {
    e.preventDefault();
    this.setState({
      isMessaging: false,
      wasMessaging: true,
      message: "",
      messageStatus: "idle"
    });
  }

  renderMyName() {
    return React.createElement("svg", {
      viewBox: "0 0 200 80",
      id: "my-name"
    }, React.createElement("path", {
      id: "curve",
      d: "M0 20 Q100 80,200 20",
      fill: "transparent"
    }), React.createElement("text", {
      id: "my-name-text"
    }, React.createElement("textPath", {
      xlinkHref: "#curve",
      "text-anchor": "middle",
      startOffset: "50%"
    }, "TIAN, MINGZHI")));
  }

  renderAnnouncement(fadeOut = false) {
    const M = this.props.announcements.length || 1;

    if (fadeOut) {
      return React.createElement("p", {
        className: "announcement"
      }, this.props.announcements[this.state.index % M]);
    }

    return React.createElement("p", {
      className: "announcement"
    }, this.props.announcements[(this.state.newIndex ?? this.state.index) % M]);
  }

  renderSelectionBar() {
    const M = this.props.announcements.length || 1;

    if (M < 2) {
      return null;
    }

    return React.createElement("div", {
      id: "selection-bar"
    }, this.props.announcements.map((element, index) => {
      let classList;

      if (this.state.newIndex == undefined && this.state.index % M == index || this.state.newIndex != undefined && this.state.newIndex % M == index) {
        classList = "selected-bar-button";
      } else {
        classList = "bar-button";
      }

      return React.createElement("span", {
        className: classList,
        onClick: () => {
          this.selectView(index);
        }
      });
    }));
  }

  render() {
    const M = this.props.backgrounds.length || 1;
    const N = this.props.announcements.length || 1;
    const isStatic = this.state.newIndex == undefined || this.state.isMessaging;
    return React.createElement("div", {
      className: "welcome-header"
    }, React.createElement("img", {
      key: "BgKey" + this.state.index,
      id: this.state.newIndex == undefined ? "static-background" : "current-background",
      className: "header-background",
      src: this.props.backgrounds[this.state.index % M],
      alt: "background image"
    }), this.state.newIndex && React.createElement("img", {
      key: "NextBgKey" + this.state.newIndex,
      id: "next-background",
      className: "header-background",
      src: this.props.backgrounds[this.state.newIndex % M],
      alt: "background image"
    }), React.createElement("img", {
      id: "avatar",
      src: this.state.isMessaging ? this.props.avatarGifs[0 | Math.random() * this.props.avatarGifs.length] : this.props.avatarImg,
      alt: "Avatar Image",
      onClick: this.toggleMessage
    }), this.renderMyName(), isStatic || this.state.wasMessaging ? null : React.createElement("div", {
      className: "header-banner",
      key: "NBannerKey" + this.state.index,
      id: "current-banner"
    }, this.renderAnnouncement(true)), React.createElement("div", {
      className: "header-banner" + (this.state.isMessaging ? " hidden" : ""),
      key: "CBannerKey" + (isStatic ? this.state.index : this.state.newIndex),
      id: isStatic || this.state.wasMessaging ? "static-banner" : "next-banner"
    }, this.renderAnnouncement()), React.createElement("div", {
      className: "header-banner" + (this.state.isMessaging ? "" : " hidden"),
      id: "message-banner"
    }, React.createElement(MessageForm, {
      message: this.state.message,
      messageStatus: this.state.messageStatus,
      onChange: this.editMessage,
      onSend: this.sendMessage,
      onCancel: this.cancelMessage
    })), this.renderSelectionBar());
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
    return React.createElement("form", {
      id: "message-form"
    }, React.createElement("textarea", {
      id: "message-textarea",
      value: this.props.message,
      placeholder: "[Enter Message Here] (Please provide your contact information if you want a response)",
      maxlength: maxLength,
      onChange: this.editText
    }), React.createElement("button", {
      className: "form-button",
      id: "message-sendbutton",
      onClick: this.props.onSend
    }, "Send"), React.createElement("button", {
      className: "form-button",
      id: "message-cancelbutton",
      onClick: this.props.onCancel
    }, "Cancel"), React.createElement("span", {
      key: this.props.messageStatus,
      className: "message-status " + this.props.messageStatus
    }, this.getStatus()), React.createElement("span", {
      className: "count" + (this.props.message.length < maxLength ? "" : " maximum")
    }, this.props.message.length, " / ", maxLength));
  }

}

class NavigationMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return React.createElement("div", {
      className: "navigation-menu"
    }, React.createElement(NavigationButton, {
      id: "home-button",
      type: "icon",
      src: "resources/Images/Site/icon_home.png",
      value: "Home Button",
      path: [],
      clickHandler: this.props.navigator
    }), this.props.nodeName != "__HOME__" && React.createElement(NavigationButton, {
      type: "topbutton",
      value: this.props.nodeName,
      path: this.props.isLeafNode ? this.props.path.slice(0, this.props.path.length - 1) : this.props.path.slice(),
      isSelected: !this.props.isLeafNode,
      clickHandler: this.props.navigator
    }), this.props.contentList.map((content, index) => {
      const buttonPath = this.props.isLeafNode ? [...this.props.path.slice(0, this.props.path.length - 1), index] : [...this.props.path, index];
      return React.createElement(NavigationButton, {
        value: this.props.isPagePrivate(buttonPath) ? "Private Article" : content,
        type: "subbutton",
        path: buttonPath,
        isSelected: this.props.isLeafNode && index == this.props.path[this.props.path.length - 1],
        clickHandler: this.props.navigator
      });
    }), this.props.nodeName != "__HOME__" && React.createElement(NavigationButton, {
      id: "back-button",
      type: "icon",
      value: "Back Button",
      src: "resources/Images/Site/icon_back.png",
      path: this.props.isLeafNode ? this.props.path.slice(0, this.props.path.length - 2) : this.props.path.slice(0, this.props.path.length - 1),
      clickHandler: this.props.navigator
    }));
  }

}

class NavigationButton extends React.Component {
  constructor(props) {
    super(props);
    this.clickHandler = this.clickHandler.bind(this);
  }

  clickHandler() {
    this.props.clickHandler(this.props.path);
  }

  render() {
    switch (this.props.type) {
      case "icon":
        return React.createElement("img", {
          id: this.props.id,
          src: this.props.src,
          alt: this.props.value,
          onClick: this.clickHandler
        });

      case "topbutton":
        return React.createElement("h3", {
          className: "navigation-button top " + (this.props.isSelected ? "selected" : "unselected"),
          onClick: this.clickHandler
        }, this.props.value.toUpperCase(), ":");

      case "subbutton":
        return React.createElement("h3", {
          className: "navigation-button item " + (this.props.isSelected ? " selected" : " unselected"),
          onClick: this.clickHandler
        }, React.createElement("span", null, "\u00bb "), this.props.value);

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
    this.props.pathNames.forEach((name, index) => {
      navigationPath.push(React.createElement("span", {
        onClick: () => {
          this.props.navigator(this.props.path.slice(0, index));
        }
      }, this.props.isPrivate && index + 1 == this.props.pathNames.length ? "Private Article" : name));

      if (index + 1 < this.props.pathNames.length) {
        navigationPath.push("   \u2192   ");
      }
    });
    return React.createElement("p", {
      id: "navigation-path"
    }, navigationPath);
  }

  getArticleName() {
    const fileMatcher = /[^/]+$/;

    if (this.props.articleList.length > 0) {
      return this.props.articleList[0].match(fileMatcher)[0];
    }

    return "not-an-article";
  }

  render() {
    return React.createElement("div", {
      className: "content-area"
    }, this.renderNavigationPath(), this.props.articleList.length == 0 && React.createElement("img", {
      className: "empty-article",
      src: "resources/Images/Site/empty.jpg",
      alt: "image that represents an empty article"
    }), this.props.isPrivate && React.createElement(PrivatePage, {
      setPublic: this.props.setPublic,
      fileName: this.getArticleName()
    }), !this.props.isPrivate && this.props.articleList.map(article => React.createElement(Article, {
      key: article,
      src: article,
      navigator: this.props.navigator,
      fillers: this.props.fillers
    })));
  }

}

class Article extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    };
    this.renderElement = this.renderElement.bind(this);
  }

  componentDidMount() {
    fetch(this.props.src).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("http status error");
      }
    }).then(jsonData => {
      this.setState({
        data: jsonData
      });
      MathJax.typeset();
    }).catch(err => this.setState({
      data: err
    }));
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

      let arr = p.split(splitter);
      return React.createElement("p", {
        className: element.indented ? "indented" : null
      }, arr.map(s => {
        if (linkMatcher.test(s)) {
          return buildLink(s);
        }

        if (boldMatcher.test(s)) {
          return React.createElement("b", null, s.match(boldMatcher)[1]);
        }

        if (italicMatcher.test(s)) {
          return React.createElement("i", null, s.match(italicMatcher)[1]);
        }

        if (delMatcher.test(s)) {
          return React.createElement("del", null, s.match(delMatcher)[1]);
        }

        if (insMatcher.test(s)) {
          return React.createElement("ins", null, s.match(insMatcher)[1]);
        }

        if (supMatcher.test(s)) {
          return React.createElement("sup", null, s.match(supMatcher)[1]);
        }

        if (subMatcher.test(s)) {
          return React.createElement("sub", null, s.match(subMatcher)[1]);
        }

        if (inlineMatcher.test(s)) {
          return React.createElement("code", null, s.match(inlineMatcher)[1]);
        }

        return s;
      }));
    }

    function buildLink(s) {
      const t = s.slice(1, s.length - 1);
      let link, clicker, target;

      if (element.links[t] == undefined) {
        link = null;

        clicker = e => {
          e.preventDefault();
          return false;
        };

        target = null;
      } else if (internalLink.test(element.links[t])) {
        link = null;

        clicker = e => {
          e.preventDefault();
          let pathString = element.links[t].match(internalLink)[1];
          let path = pathString == "" ? [] : pathString.split(/, */).map(n => +n);
          navigator(path);
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
    const splitter = /(\^[^^]+\^|\^\^[^^]+\^\^|\*[^*]+\*|\*\*[^*]+\*\*|~[^~]+~|~~[^~]+~~|<<[^<>]+>>|{[^{}]+})/g;
    const linkMatcher = /^{[^{}]+}$/;
    const boldMatcher = /^\*\*([^*]+)\*\*$/;
    const italicMatcher = /^\*([^*]+)\*$/;
    const delMatcher = /^~~([^~]+)~~$/;
    const insMatcher = /^~([^~]+)~$/;
    const supMatcher = /^\^([^^]+)\^$/;
    const subMatcher = /^\^\^([^^]+)\^\^$/;
    const inlineMatcher = /^<<([^<>]+)>>$/;
    const codeMatcher = /^<(.*)>$/;
    const internalLink = /^internal::(.*)$/;
    const navigator = this.props.navigator;
    return React.createElement("div", {
      className: "text"
    }, paragraphs.map(buildParagraph));
  }

  renderEquationElement(element) {
    if (this.props.isMinimized) {
      return null;
    }

    return React.createElement("p", {
      className: "equation"
    }, element.TeX);
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

  renderPlaceholder(element) {
    switch (this.props.fillers[element.name].filler_type) {
      case "Runnable":
        return React.createElement(Runnable, _extends({}, this.props.fillers[element.name], {
          navigator: this.props.navigator
        }));

      default:
        return null;
    }
  }

  renderElement(element) {
    switch (element.type) {
      case "text":
        return this.renderTextElement(element);

      case "equation":
        return this.renderEquationElement(element);

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
      return React.createElement(LoadIndicator, null);
    } else if (this.state.data instanceof Error) {
      return React.createElement(ErrorIndicator, {
        type: "Article"
      });
    }

    return React.createElement("div", {
      className: "article"
    }, this.renderTitle(this.state.data.title), this.renderAuthors(this.state.data.authors), this.renderDate(this.state.data.creationDate, this.state.data.lastModified), this.state.data.components.map(this.renderElement));
  }

}

class Runnable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isError: false,
      isHidden: true
    };
    this.hideToggler = this.hideToggler.bind(this);
  }

  getMessage() {
    if (this.state.isLoading) {
      return React.createElement("b", {
        className: "load"
      }, "LOADING...");
    }

    if (this.state.isError) {
      return React.createElement("b", {
        className: "error"
      }, "Critical Failure");
    }

    return null;
  }

  clickHandler() {
    this.setState({
      isLoading: true
    });
    this.props.loader().then(() => {
      this.setState({
        isLoading: false
      });
      this.props.runner();
    }).catch(err => {
      this.setState({
        isLoading: false,
        isError: true
      });
    });
  }

  hideToggler() {
    this.setState(state => ({
      isHidden: !state.isHidden
    }));
  }

  render() {
    return React.createElement("div", {
      className: "runnable" + (this.state.isHidden ? "" : " expanded"),
      id: this.props.id
    }, React.createElement("h4", {
      className: "runnable-title"
    }, this.props.name), React.createElement("div", {
      className: "runnable-button",
      onClick: this.clickHandler.bind(this)
    }, React.createElement("img", {
      className: "runnable-icon",
      src: this.props.iconSource
    }), React.createElement("span", {
      className: "status"
    }, this.getMessage())), React.createElement("br", null), React.createElement(LinkEmbedText, {
      src: this.props.introSource,
      navigator: this.props.navigator
    }), React.createElement(HideToggler, {
      isHidden: this.state.isHidden,
      hideToggler: this.hideToggler
    }));
  }

}

class Code extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      isHidden: true
    };
    this.hideToggler = this.hideToggler.bind(this);
  }

  hideToggler() {
    this.setState(state => ({
      isHidden: !state.isHidden
    }));
  }

  countLines(str) {
    const lineBreaks = /[\r\n]|\r\n/;
    return str.split(lineBreaks).length;
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
        data: text,
        isHidden: this.countLines(text) > 20
      });
    }).catch(err => {
      this.setState({
        data: err
      });
    });
  }

  componentDidUpdate() {
    if (this.state.data == undefined || this.state.data instanceof Error) {
      return;
    }

    let cur = ReactDOM.findDOMNode(this);
    hljs.highlightBlock(cur.firstChild);
  }

  render() {
    if (this.state.data == undefined) {
      return null;
    }

    if (this.state.data instanceof Error) {
      return React.createElement(ErrorIndicator, {
        type: "Code"
      });
    }

    return React.createElement("div", {
      className: "code" + (this.state.isHidden ? "" : " expanded")
    }, React.createElement("pre", null, React.createElement("code", null, this.state.data)), this.countLines(this.state.data) > 20 && React.createElement(HideToggler, {
      isHidden: this.state.isHidden,
      hideToggler: this.hideToggler
    }));
  }

}

class LinkEmbedText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    if (this.state.data != null) {
      return;
    }

    fetch(this.props.src).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("http status error");
      }
    }).then(jsonData => {
      this.setState({
        data: jsonData
      });
    }, err => {
      this.setState({
        data: err
      });
    });
  }

  renderData() {
    function buildLink(s) {
      const t = s.slice(1, s.length - 1);
      let link, clicker, target;

      if (data.links[t] == undefined) {
        link = null;

        clicker = e => {
          e.preventDefault();
          return false;
        };

        target = null;
      } else if (internalLink.test(data.links[t])) {
        link = null;

        clicker = e => {
          e.preventDefault();
          let pathString = data.links[t].match(internalLink)[1];
          let path = pathString == "" ? [] : pathString.split(/, */).map(n => +n);
          navigator(path);
          return false;
        };

        target = null;
      } else {
        link = data.links[t];
        clicker = null;
        target = "_blank";
      }

      return React.createElement("a", {
        href: link,
        onClick: clicker,
        target: target
      }, t);
    }

    const data = this.state.data;
    const internalLink = /^internal::(.*)$/;
    const navigator = this.props.navigator;
    let arr = this.state.data.text.split(/({[^{}]+})/g);
    return React.createElement("p", {
      className: "link-embed-text"
    }, arr.map(s => {
      if (/^{[^{}]+}$/.test(s)) {
        const t = s.slice(1, s.length - 1);
        return buildLink(s);
      }

      return s;
    }));
  }

  render() {
    if (this.state.data == null) {
      return React.createElement(LoadIndicator, null);
    } else if (this.state.data instanceof Error) {
      return React.createElement(ErrorIndicator, {
        type: "Text"
      });
    }

    return this.renderData();
  }

}

class PrivatePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      message: ""
    };
    this.editPassword = this.editPassword.bind(this);
    this.confirmPassword = this.confirmPassword.bind(this);
  }

  editPassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  confirmPassword() {
    this.setState({
      message: "verifying password"
    });
    let payload = {
      requested_item: this.props.fileName + "#article_password",
      password: this.state.password
    };
    console.log(payload);
    fetch("https://3xi9x564h3.execute-api.us-east-2.amazonaws.com/check_password", {
      method: "POST",
      body: JSON.stringify(payload)
    }).then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error("Server Error");
      }
    }).then(text => {
      if (text == "authorized") {
        this.setState({
          message: "Authorized"
        });
        this.props.setPublic();
      } else {
        this.setState({
          message: "Incorrect Password"
        });
      }
    }).catch(e => {
      this.setState({
        message: "Network Error"
      });
    });
  }

  getMessageClass() {
    switch (this.state.message) {
      case "Incorrect Password":
        return "failure";

      case "Network Error":
        return "failure";

      case "Authorized":
        return "success";

      default:
        return "pending";
    }
  }

  render() {
    return React.createElement("div", {
      id: "private-page"
    }, React.createElement("h2", {
      id: "private-title"
    }, "This Page is set to Private"), React.createElement("input", {
      id: "password-field",
      type: "password",
      placeholder: "Enter Password Here",
      onChange: this.editPassword
    }), React.createElement("br", null), React.createElement("button", {
      id: "password-button",
      onClick: this.confirmPassword
    }, "Continue to Page"), React.createElement("br", null), React.createElement("h4", null, React.createElement("span", {
      className: this.getMessageClass()
    }, this.state.message)));
  }

}

function HideToggler(props) {
  return React.createElement("div", {
    className: "hide-toggler" + (props.isHidden ? "" : " show"),
    onClick: props.hideToggler
  }, React.createElement("b", null, props.isHidden ? "Show More" : "Hide"));
}

function LoadIndicator(props) {
  return React.createElement("img", {
    className: "load-indicator",
    src: "resources/Images/Site/gif_spinner.gif"
  });
}

function ErrorIndicator(props) {
  return React.createElement("div", {
    className: "error-indicator"
  }, React.createElement("img", {
    className: "error-image",
    src: "resources/Images/Site/gif_error.gif",
    alt: "picture that indicates an error"
  }), React.createElement("span", {
    className: "error-text"
  }, props.type, " Not Found"));
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
    }
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
    }
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
    }
  }
};

function parseQuery() {
  const querySyntax = /^\?article=(.*)$/;

  if (querySyntax.test(window.location.search)) {
    let path = window.location.search.match(querySyntax)[1];
    return path.split(",").map(n => +n);
  }

  return [];
}

fetch("resources/JSON/Site/setup.json").then(response => {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error("http server error");
  }
}).then(jsonData => {
  ReactDOM.render(React.createElement(MainPage, {
    path: parseQuery(),
    data: jsonData,
    globalFillers: fillers
  }), document.getElementById("root"));
}, err => {
  ReactDOM.render(React.createElement(MainPage, {
    data: err
  }), document.getElementById("root"));
});
