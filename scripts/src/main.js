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
        this.state = {currentPage : "HOME"};
    }

    navigateTo(newPage) {
        this.setState({currentPage: newPage});
    }

    render() {
        return (
            <div id = "PersonalSite">
                <WelcomeHeader name = "Ming"/>
                <hr/>
                <NavigationMenu 
                    page = {this.state.currentPage} 
                    clickHandler = {this.navigateTo.bind(this)} />
                <ContentsArea page = {this.state.currentPage}/>
            </div>
        );
    }
}

class WelcomeHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {name : "Everyone"};
    }

    componentDidMount() {
        setTimeout(
            () => {
                this.setState({name : this.props.name});
            },
            2000,
        );
    }

    render() {
        return (
            <div className = "WelcomeHeader">
                <Avatar/>
                <h1>Welcome! {this.state.name}</h1>
            </div>
        );
    }

}

class Avatar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <img id = "avatar" src = "resources/Images/coolFace.jpg"/>
        );
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
        const pages = [
            "HOME",
            "ABOUT",
            "SAMPLES",
            "PROJECTS",
            "CONTACT",
        ];
        return (
            <div className = "NavigationMenu">
            {pages.map(
                pageName => {
                    return (
                        <NavigationButton 
                            name = {pageName} 
                            isSelected = {this.props.page == pageName} 
                            clickHandler = {this.props.clickHandler}
                        />
                    );
                }
            )}
            </div>
        );
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
        return (
            <h3 
                onClick = {this.clickHandler.bind(this)} 
                className = {this.getClass()}>
            {this.props.name}
            </h3>
        );
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
                return (
                    <HomePage 
                        className = "ContentsArea" 
                        page = {this.props.page}/>
                );
            case "ABOUT":
                return (
                    <AboutPage 
                        className = "ContentsArea" 
                        page = {this.props.page}/>
                );
            case "SAMPLES":
                return (
                    <SamplesPage 
                        className = "ContentsArea" 
                        page = {this.props.page}/>
                );
            case "PROJECTS":
                return (
                    <ProjectsPage 
                        className = "ContentsArea" 
                        page = {this.props.page}/>
                );
                return <ProjectsPage className = {this.props.page}/>;
            case "CONTACT":
                return (
                    <ContactPage 
                        className = "ContentsArea" 
                        page = {this.props.page}/>
                );
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
        return (
            <div className = {this.props.className}>
                <h1>{this.props.page}</h1>
            </div>
        );
    }
}

class AboutPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className = {this.props.className}>
                <h1>{this.props.page}</h1>
            </div>
        );
    }
}

class SamplesPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className = {this.props.className}>
                <h1>{this.props.page}</h1>
                <LinkEmbedText
                    type = "indented"
                    src = "bad-src"/>
                <br/>
                <GameSample
                    name = "Cartpole"
                    src = "bad-src"
                    loader = {Cartpole.loadAssets}
                    runner = {
                        () => {
                            let game = new Cartpole();
                        }
                    } />
                <GameSample
                    name = "Minesweeper"
                    src = "resources/JSON/test.json"
                    loader = {Minesweeper.loadAssets}
                    runner = {
                        () => {
                            let game = new Minesweeper();
                        }
                    } />
                <GameSample
                    name = "Snake"
                    src = "bad-src"
                    loader = {Snake.loadAssets}
                    runner = {
                        () => {
                            let game = new Snake();
                        }
                    } />
            </div>
        );
    }
}

class ProjectsPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className = {this.props.className}>
                <h1>{this.props.page}</h1>
            </div>
        );
    }
}

class ContactPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className = {this.props.className}>
                <h1>{this.props.page}</h1>
            </div>
        );
    }
}

class LinkEmbedText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data : null};
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

    buildLink(token) {
        if (token == undefined) {
            return null;
        }
        const link = token.slice(1, token.length - 1);
        return (
            <a href = {this.state.data.links[link]} target = "_blank">
            {link}
            </a>
        );
    }

    merge(texts, links) {
        let merged = [texts[0]];
        for (let i = 1; i < texts.length; i++) {
            merged.push( this.buildLink( links[i - 1] ) );
            merged.push( texts[i] );
        }
        return merged;
    }

    formatData() {
        return this.state.data.text.map(
            (text) => {
                let links = text.match(/{[^{}]+}/g);
                let interLinkText = text.split(/{[^{}]+}/);
                return (
                    <p className = {this.props.type}>
                    {this.merge(interLinkText, links)}
                    </p>
                );
            }
        );
    }

    render() {
        if (this.state.data == null) {
            return <LoadIndicator/>;
        } else if (this.state.data instanceof Error) {
            return <ErrorIndicator/>;
        }
        return (
            <div>
                {this.formatData()}
            </div>
        );
    }
}

class GameSample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isLoading: false};
    }

    clickHandler() {
        this.setState({isLoading: true});
        this.props.loader().
            then(() => {
                this.setState({isLoading: false});
                this.props.runner();
            });
    }

    render() {
        return (
            <div className = "GameSample" id = {this.props.name}>
                <h4 className = "GameName">{this.props.name}</h4>
                <button 
                    className = "gameButton"
                    id = {this.props.name + "Game"}
                    onClick = {this.clickHandler.bind(this)}>
                {this.state.isLoading? "LOADING..." : "Click to Play"}
                </button>
                <br/>
                <LinkEmbedText 
                    type = "block"
                    src = {this.props.src}/>
            </div>
        );
    }
}

function LoadIndicator(props) {
    return (
        <img 
            className = "LoadIndicator" 
            src = "resources/Gifs/load_spinner.gif" />
    );
}

function ErrorIndicator(props) {
    return (
        <img 
            className = "ErrorIndicator" 
            src = "resources/Images/smileyFace.png" />
    );
}

ReactDOM.render(
    <MainPage/>,
    document.getElementById("root"),
);
