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
*/
// React page

class MainPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: "HOME"
    };
  }

  navigateTo(newPage) {
    this.setState({
      currentPage: newPage
    });
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      id: "PersonalSite"
    }, /*#__PURE__*/React.createElement(WelcomeHeader, {
      name: "Ming"
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(NavigationMenu, {
      page: this.state.currentPage,
      clickHandler: this.navigateTo.bind(this)
    }), /*#__PURE__*/React.createElement(ContentsArea, {
      page: this.state.currentPage
    }));
  }

}

class WelcomeHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "Everyone"
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        name: this.props.name
      });
    }, 2000);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "WelcomeHeader"
    }, /*#__PURE__*/React.createElement(Avatar, null), /*#__PURE__*/React.createElement("h1", null, "Welcome! ", this.state.name));
  }

}

class Avatar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("img", {
      id: "avatar",
      src: "resources/Images/Site/coolFace.jpg"
    });
  }

}

class Messenge extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return null;
  }

}

class NavigationMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const pages = ["HOME", "ABOUT", "SAMPLES", "PROJECTS", "CONTACT"];
    return /*#__PURE__*/React.createElement("div", {
      className: "NavigationMenu"
    }, pages.map(pageName => {
      return /*#__PURE__*/React.createElement(NavigationButton, {
        name: pageName,
        isSelected: this.props.page == pageName,
        clickHandler: this.props.clickHandler
      });
    }));
  }

}

class NavigationButton extends React.Component {
  constructor(props) {
    super(props);
  }

  clickHandler(e) {
    e.preventDefault();
    this.props.clickHandler(this.props.name);
  }

  getClass() {
    if (this.props.isSelected) {
      return "SelectedButton";
    }

    return "UnselectedButton";
  }

  render() {
    return /*#__PURE__*/React.createElement("h3", {
      onClick: this.clickHandler.bind(this),
      className: this.getClass()
    }, this.props.name);
  }

}

class ContentsArea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let content;

    switch (this.props.page) {
      case "HOME":
        return /*#__PURE__*/React.createElement(HomePage, {
          className: "ContentsArea",
          page: this.props.page
        });

      case "ABOUT":
        return /*#__PURE__*/React.createElement(AboutPage, {
          className: "ContentsArea",
          page: this.props.page
        });

      case "SAMPLES":
        return /*#__PURE__*/React.createElement(SamplesPage, {
          className: "ContentsArea",
          page: this.props.page
        });

      case "PROJECTS":
        return /*#__PURE__*/React.createElement(ProjectsPage, {
          className: "ContentsArea",
          page: this.props.page
        });
        return /*#__PURE__*/React.createElement(ProjectsPage, {
          className: this.props.page
        });

      case "CONTACT":
        return /*#__PURE__*/React.createElement(ContactPage, {
          className: "ContentsArea",
          page: this.props.page
        });

      default:
        return null;
    }
  }

}

class HomePage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: this.props.className
    }, /*#__PURE__*/React.createElement("h1", null, this.props.page));
  }

}

class AboutPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: this.props.className
    }, /*#__PURE__*/React.createElement("h1", null, this.props.page));
  }

}

class SamplesPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: this.props.className
    }, /*#__PURE__*/React.createElement("h1", null, this.props.page), /*#__PURE__*/React.createElement(LinkEmbedText, {
      type: "indented",
      src: "bad-src"
    }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Runnable, {
      name: "Cartpole",
      iconSource: "resources/Images/Cartpole/cartpole.png",
      introSource: "bad-src",
      loader: Cartpole.loadAssets,
      runner: () => {
        let game = new Cartpole();
      }
    }), /*#__PURE__*/React.createElement(Runnable, {
      name: "Minesweeper",
      className: "gameSample",
      iconSource: "resources/Images/Minesweeper/mine.png",
      introSource: "resources/JSON/test.json",
      loader: Minesweeper.loadAssets,
      runner: () => {
        let game = new Minesweeper();
      }
    }), /*#__PURE__*/React.createElement(Runnable, {
      name: "Snake",
      className: "gameSample",
      iconSource: "resources/Images/Snake/snake.png",
      introSource: "bad-src",
      loader: Snake.loadAssets,
      runner: () => {
        let game = new Snake();
      }
    }));
  }

}

class ProjectsPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: this.props.className
    }, /*#__PURE__*/React.createElement("h1", null, this.props.page));
  }

}

class ContactPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: this.props.className
    }, /*#__PURE__*/React.createElement("h1", null, this.props.page));
  }

}

class Article extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
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
    }).catch(err => this.setState({
      data: err
    }));
  }

  buildLink(token) {
    if (token == undefined) {
      return null;
    }

    const link = token.slice(1, token.length - 1);
    return /*#__PURE__*/React.createElement("a", {
      href: this.state.data.links[link],
      target: "_blank"
    }, link);
  }

  renderComponent() {
    return null;
  }

  renderArticle() {
    return null;
  }

  render() {
    if (this.state.data == null) {
      return /*#__PURE__*/React.createElement(LoadIndicator, null);
    } else if (this.state.data instanceof Error) {
      return /*#__PURE__*/React.createElement(ErrorIndicator, null);
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "article"
    }, this.renderArticle());
  }

}

class LinkEmbedText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
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
    }).catch(err => this.setState({
      data: err
    }));
  }

  buildLink(token) {
    if (token == undefined) {
      return null;
    }

    const link = token.slice(1, token.length - 1);
    return /*#__PURE__*/React.createElement("a", {
      href: this.state.data.links[link],
      target: "_blank"
    }, link);
  }

  merge(texts, links) {
    let merged = [texts[0]];

    for (let i = 1; i < texts.length; i++) {
      merged.push(this.buildLink(links[i - 1]));
      merged.push(texts[i]);
    }

    return merged;
  }

  renderData() {
    return this.state.data.text.map(text => {
      let links = text.match(/{[^{}]+}/g);
      let interLinkText = text.split(/{[^{}]+}/);
      return /*#__PURE__*/React.createElement("p", {
        className: this.props.type
      }, this.merge(interLinkText, links));
    });
  }

  render() {
    if (this.state.data == null) {
      return /*#__PURE__*/React.createElement(LoadIndicator, null);
    } else if (this.state.data instanceof Error) {
      return /*#__PURE__*/React.createElement(ErrorIndicator, null);
    }

    return /*#__PURE__*/React.createElement("div", null, this.renderData());
  }

}

class Runnable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isError: false
    };
  }

  getMessage() {
    if (this.state.isLoading) {
      return /*#__PURE__*/React.createElement("b", {
        className: "load"
      }, "LOADING...");
    }

    if (this.state.isError) {
      return /*#__PURE__*/React.createElement("b", {
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
        isLoading: false
      });
      this.setState({
        isError: true
      });
    });
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "Runnable",
      id: this.props.name
    }, /*#__PURE__*/React.createElement("h4", {
      className: "Title"
    }, this.props.name), /*#__PURE__*/React.createElement("div", {
      className: "runnableButton",
      onClick: this.clickHandler.bind(this)
    }, /*#__PURE__*/React.createElement("img", {
      className: "runnableIcon",
      src: this.props.iconSource
    }), /*#__PURE__*/React.createElement("span", {
      className: "status"
    }, this.getMessage())), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(LinkEmbedText, {
      type: "block",
      src: this.props.introSource
    }));
  }

}

function LoadIndicator(props) {
  return /*#__PURE__*/React.createElement("img", {
    className: "LoadIndicator",
    src: "resources/Images/Site/load_spinner.gif"
  });
}

function ErrorIndicator(props) {
  return /*#__PURE__*/React.createElement("img", {
    className: "ErrorIndicator",
    src: "resources/Images/Site/smileyFace.png"
  });
}

ReactDOM.render( /*#__PURE__*/React.createElement(MainPage, null), document.getElementById("root"));
