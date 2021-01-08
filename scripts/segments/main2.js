function HideToggler(props) {
    return (
        <div 
            className = {"hide-toggler" + 
                (props.isHidden ? "" : " show")
            }
            onClick = {props.hideToggler}>
            <b>{props.isHidden ? "Show More" : "Hide"}</b>
        </div>
    )
}

function LoadIndicator(props) {
    // in the future it will be updated to more cool-looking
    // animations
    return (
        <img 
            className = "load-indicator" 
            src = "resources/Images/Site/gif_spinner.gif" />
    );
}

function ErrorIndicator(props) {
    return (
        <div className = "error-indicator">
            <img 
                className = "error-image" 
                src = "resources/Images/Site/gif_error.gif" 
                alt = "picture that indicates an error"/>
            <span className = "error-text">
            {props.type} Not Found
            </span>
        </div>
    );
}
