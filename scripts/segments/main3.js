class Runnable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isError: false,
            isHidden: true,
        };
        this.hideToggler = this.hideToggler.bind(this);
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
                this.setState(
                    {
                        isLoading: false,
                        isError: true,
                    }
                );
            });
    }

    hideToggler() {
        this.setState(
            state => ({isHidden: !state.isHidden})
        );
    }

    render() {
        return (
            <div 
                className = {"runnable" + 
                    (this.state.isHidden ? "" : " expanded")
                }
                id = {this.props.id}>
                <h4 className = "runnable-title">{this.props.name}</h4>
                <div 
                    className = "runnable-button"
                    onClick = {this.clickHandler.bind(this)}>
                <img 
                    className = "runnable-icon"
                    src = {this.props.iconSource} />
                <span className = "status">
                {this.getMessage()}
                </span>
                </div>
                <br/>
                <LinkEmbedText 
                    src = {this.props.introSource}
                    navigator = {this.props.navigator} />
                <HideToggler 
                    isHidden = {this.state.isHidden}
                    hideToggler = {this.hideToggler} />
            </div>
        );
    }
}
