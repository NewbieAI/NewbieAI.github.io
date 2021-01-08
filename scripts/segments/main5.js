class NavigationMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className = "navigation-menu">
                <NavigationButton 
                    id = "home-button"
                    type = "icon" 
                    src = "resources/Images/Site/icon_home.png"
                    value = "Home Button"
                    path = {[]}
                    clickHandler = {this.props.navigator} />
                {this.props.nodeName != "__HOME__" && 
                    <NavigationButton 
                        type = "topbutton"
                        value = {this.props.nodeName}
                        path = {
                            this.props.isLeafNode ?
                            this.props.path.slice(
                                0, this.props.path.length - 1
                            )
                            :
                            this.props.path.slice()
                        }
                        isSelected = {!this.props.isLeafNode}
                        clickHandler = {this.props.navigator} />
                }
                {this.props.contentList.map(
                    (content, index) => (
                        <NavigationButton
                            value = {content}
                            type = "subbutton"
                            path = {
                                this.props.isLeafNode?
                                [
                                    ...this.props.path.slice(
                                        0, this.props.path.length - 1
                                    ), 
                                    index,
                                ]
                                :
                                [...this.props.path, index]
                            }
                            isSelected = {
                                this.props.isLeafNode
                                &&
                                index == this.props.path[
                                    this.props.path.length - 1
                                ]
                            }
                            clickHandler = {this.props.navigator} />
                    )
                )}
                {this.props.nodeName != "__HOME__" &&
                    <NavigationButton 
                        id = "back-button"
                        type = "icon"
                        value = "Back Button"
                        src = "resources/Images/Site/icon_back.png"
                        path = {
                            this.props.isLeafNode ?
                            this.props.path.slice(
                                0, this.props.path.length - 2,
                            )
                            :
                            this.props.path.slice(
                                0, this.props.path.length - 1,
                            )
                        }
                        clickHandler = {this.props.navigator} />
                }
            </div>
        );
    }
}

class NavigationButton extends React.Component {
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
    }

    clickHandler() {
        this.props.clickHandler(
            this.props.path
        );
    }

    render() {
        switch (this.props.type) {
            case "icon":
                return (
                    <img
                        id = {this.props.id}
                        src = {this.props.src}
                        alt = {this.props.value} 
                        onClick = {this.clickHandler} />
                );
            case "topbutton":
                return (
                    <h3
                        className = {
                            "navigation-button top " + (
                                this.props.isSelected ? 
                                "selected" : "unselected"
                            )
                        }
                        onClick = {this.clickHandler}>
                    {this.props.value.toUpperCase()}:
                    </h3>
                );
            case "subbutton":
                return (
                    <h3
                        className = {
                            "navigation-button item " + (
                                this.props.isSelected ? 
                                " selected" : " unselected"
                            )
                        }
                        onClick = {this.clickHandler}>
                    <span>
                    {"\u00bb "}
                    </span>
                    {this.props.value}
                    </h3>
                );
            default:
                return null;
        }
    }
}
