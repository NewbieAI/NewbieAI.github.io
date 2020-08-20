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
            <img 
                id = "avatar" 
                src = "resources/Images/Site/coolFace.jpg"/>
        );
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
                <Runnable
                    name = "Cartpole"
                    iconSource = "resources/Images/Cartpole/cartpole.png"
                    introSource = "bad-src"
                    loader = {Cartpole.loadAssets}
                    runner = {
                        () => {
                            let game = new Cartpole();
                        }
                    } />
                <Runnable
                    name = "Minesweeper"
                    className = "gameSample"
                    iconSource = "resources/Images/Minesweeper/mine.png"
                    introSource = "resources/JSON/test.json"
                    loader = {Minesweeper.loadAssets}
                    runner = {
                        () => {
                            let game = new Minesweeper();
                        }
                    } />
                <Runnable
                    name = "Snake"
                    className = "gameSample"
                    iconSource = "resources/Images/Snake/snake.png"
                    introSource = "bad-src"
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

class Article extends React.Component {
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

    renderComponent() {
        return null;
    }

    renderArticle() {
        return null;
    }

    render() {
        if (this.state.data == null) {
            return <LoadIndicator/>;
        } else if (this.state.data instanceof Error) {
            return <ErrorIndicator/>;
        }
        return (
            <div className = "article">
                {this.renderArticle()}
            </div>
        );
    }
}

class LinkEmbedText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data : this.props.data};
    }

    componentDidMount() {
        if (this.state.data != null) {
            return;
        }
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

    renderData() {
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
                {this.renderData()}
            </div>
        );
    }
}

class Runnable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isError: false,
        };
    }

    getMessage() {
        if (this.state.isLoading) {
            return <b className = "load">LOADING...</b>;
        }
        if (this.state.isError) {
            return <b className = "error">Critical Failure</b>;
        }
        return null;
    }

    clickHandler() {
        this.setState({isLoading: true});
        this.props.loader().
            then( () => {
                this.setState({
                    isLoading: false,
                });
                this.props.runner();
            }).
            catch( err => {
                this.setState({isLoading: false});
                this.setState({isError: true});
            });
    }

    render() {
        return (
            <div className = "Runnable" id = {this.props.name}>
                <h4 className = "Title">{this.props.name}</h4>
                <div 
                    className = "runnableButton"
                    onClick = {this.clickHandler.bind(this)}>
                <img 
                    className = "runnableIcon"
                    src = {this.props.iconSource} />
                <span className = "status">
                {this.getMessage()}
                </span>
                </div>
                <br/>
                <LinkEmbedText 
                    type = "block"
                    src = {this.props.introSource}/>
            </div>
        );
    }
}

function LoadIndicator(props) {
    return (
        <img 
            className = "LoadIndicator" 
            src = "resources/Images/Site/load_spinner.gif" />
    );
}

function ErrorIndicator(props) {
    return (
        <img 
            className = "ErrorIndicator" 
            src = "resources/Images/Site/smileyFace.png" />
    );
}

ReactDOM.render(
    <MainPage/>,
    document.getElementById("root"),
);
