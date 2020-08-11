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
      src: "resources/Images/coolFace.jpg"
    });
  }

}

class MessageBox extends React.Component {
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
      src: "bad-src"
    }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(GameSample, {
      name: "Cartpole",
      src: "bad-src",
      loader: Cartpole.loadAssets,
      runner: () => {
        let game = new Cartpole();
      }
    }), /*#__PURE__*/React.createElement(GameSample, {
      name: "Minesweeper",
      src: "resources/JSON/test.json",
      loader: Minesweeper.loadAssets,
      runner: () => {
        let game = new Minesweeper();
      }
    }), /*#__PURE__*/React.createElement(GameSample, {
      name: "Snake",
      src: "bad-src",
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

class LinkEmbedText extends React.Component {
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

  merge(texts, links) {
    let merged = [texts[0]];

    for (let i = 1; i < texts.length; i++) {
      merged.push(this.buildLink(links[i - 1]));
      merged.push(texts[i]);
    }

    return merged;
  }

  formatData() {
    return this.state.data.text.map(text => {
      let links = text.match(/{[^{}]+}/g);
      let interLinkText = text.split(/{[^{}]+}/);
      return /*#__PURE__*/React.createElement("p", null, this.merge(interLinkText, links));
    });
  }

  render() {
    if (this.state.data == null) {
      return /*#__PURE__*/React.createElement(LoadIndicator, null);
    } else if (this.state.data instanceof Error) {
      return /*#__PURE__*/React.createElement(ErrorIndicator, null);
    }

    return /*#__PURE__*/React.createElement("div", {
      className: this.props.className
    }, this.formatData());
  }

}

class GameSample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
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
    });
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "GameSample",
      id: this.props.name
    }, /*#__PURE__*/React.createElement("h4", {
      className: "GameName"
    }, this.props.name), /*#__PURE__*/React.createElement("button", {
      className: "gameButton",
      id: this.props.name + "Game",
      onClick: this.clickHandler.bind(this)
    }, this.state.isLoading ? "LOADING..." : "Click to Play"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(LinkEmbedText, {
      className: "GameIntro",
      src: this.props.src
    }));
  }

}

function LoadIndicator(props) {
  return /*#__PURE__*/React.createElement("img", {
    className: "LoadIndicator",
    src: "resources/Gifs/load_spinner.gif"
  });
}

function ErrorIndicator(props) {
  return /*#__PURE__*/React.createElement("img", {
    className: "ErrorIndicator",
    src: "resources/Images/smileyFace.png"
  });
}

ReactDOM.render( /*#__PURE__*/React.createElement(MainPage, null), document.getElementById("root"));
