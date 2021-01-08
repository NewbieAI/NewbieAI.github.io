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
