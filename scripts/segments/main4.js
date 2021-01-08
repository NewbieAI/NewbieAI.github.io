class WelcomeHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            newIndex: null,
            isMessaging: false,
            wasMessaging: false,
            message: "",
            messageStatus: "idle",
        };
        this.startSlider = this.startSlider.bind(this);
        this.toggleMessage = this.toggleMessage.bind(this)
        this.selectView = this.selectView.bind(this);
        this.editMessage = this.editMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.cancelMessage = this.cancelMessage.bind(this);
    }

    startSlider() {
        this.setState(
            state => {
                if (state.newIndex == undefined) {
                    return {
                        index: state.index,
                        newIndex: state.index + 1,
                        wasMessaging: false,
                    };
                }
                return {
                    index: state.index + 1,
                    newIndex: state.newIndex + 1,
                    wasMessaging: false,
                };
            }
        );
        this.sliderIntervalID = setInterval(
            () => {
                this.setState(
                    state => ({
                        index: state.index + 1,
                        newIndex: state.newIndex + 1,
                        wasMessaging: false,
                    })
                );
            },
            15000,
        );
    }

    componentDidMount() {
        this.sliderTimeoutID = setTimeout(
            this.startSlider,
            12000,
        );
    }

    componentWillDismount() {
        clearInterval(this.sliderIntervalID);
        clearTimeout(this.sliderTimeoutID);
    }

    toggleMessage() {
        this.setState(
            state => ({
                isMessaging: !state.isMessaging,
                wasMessaging: state.isMessaging,
            })
        );
    }

    selectView(view) {
        clearInterval(this.sliderIntervalID);
        clearTimeout(this.sliderTimeoutID);
        const M = this.props.announcements.length || 1;
        this.setState(
            state => ({
                index: (
                    state.index + (
                        view >= state.index % M ?
                        view - state.index % M : 
                        M + view - state.index % M
                    )
                ),
                newIndex: null,
            })
        );
        this.sliderTimeoutID = setTimeout(
            this.startSlider,
            30000,
        );
    }

    editMessage(text) {
        this.setState(
            {
                message: text,
                messageStatus: "editing",
            }
        );
    }

    sendMessage(e) {
        e.preventDefault();
        this.setState({messageStatus: "pending"});
        fetch(
            "https://9tsemll1m6.execute-api.us-east-2.amazonaws.com/",
            {
                method: "POST",
                body: this.state.message,
            },
        ).then(
            response => {
                if (response.ok) {
                    this.setState({messageStatus: "success"});
                } else {
                    throw new Error("http status error");
                }
            }
        ).catch(
            e => {
                this.setState({messageStatus: "failure"});
            }
        );
    }

    cancelMessage(e) {
        e.preventDefault();
        this.setState({
            isMessaging: false,
            wasMessaging: true,
            message: "",
            messageStatus: "idle",
        });
    }
    
    renderMyName() {
        return (
            <svg viewBox = "0 0 200 80" id = "my-name">
                <path
                    id = "curve"
                    d = "M0 20 Q100 80,200 20"
                    fill = "transparent"/>
                <text id = "my-name-text">
                    <textPath 
                        xlinkHref = "#curve"
                        text-anchor = "middle"
                        startOffset = "50%">
                        TIAN, MINGZHI
                    </textPath>
                </text>
            </svg>
        );
    }

    renderAnnouncement(fadeOut = false) {
        const M = this.props.announcements.length || 1;
        if (fadeOut) {
            return (
                <p className = "announcement">
                {this.props.announcements[
                    this.state.index % M
                ]}
                </p>
            )
        }
        return (
            <p className = "announcement">
            {this.props.announcements[
                (this.state.newIndex ?? this.state.index) % M
            ]}
            </p>
        );
    }

    renderSelectionBar() {
        const M = this.props.announcements.length || 1;
        if (M < 2) {
            return null;
        }
        return (
            <div id = "selection-bar">
            {this.props.announcements.map(
                (element, index) => {
                    let classList;
                    if ((this.state.newIndex == undefined && 
                        this.state.index % M == index) ||
                        (this.state.newIndex != undefined && 
                        this.state.newIndex % M == index)) {
                        classList = "selected-bar-button"
                    } else {
                        classList = "bar-button"
                    }
                    return (
                        <span 
                            className = {classList}
                            onClick = {
                                () => {
                                    this.selectView(index);
                                }
                            }>
                        </span>
                    );
                }
            )}
            </div>
        );
    }

    render() {
        const M = this.props.backgrounds.length || 1;
        const N = this.props.announcements.length || 1;
        const isStatic = (
            this.state.newIndex == undefined ||
            this.state.isMessaging
        );
        return (
            <div className = "welcome-header">
                <img 
                    key = {
                        "BgKey" + this.state.index}
                    id = {
                        this.state.newIndex == undefined ?
                        "static-background" : "current-background"
                    }
                    className = "header-background"
                    src = {
                        this.props.backgrounds[ this.state.index % M ]
                    } 
                    alt = "background image" />
                {this.state.newIndex &&
                    <img
                        key = {"NextBgKey" + this.state.newIndex}
                        id = "next-background"
                        className = "header-background"
                        src = {
                            this.props.backgrounds[
                                this.state.newIndex % M
                            ]
                        } 
                        alt = "background image" />
                }
                <img 
                    id = "avatar"
                    src = {
                        this.state.isMessaging ?
                        this.props.avatarGifs[ 
                            0 | Math.random() * this.props.avatarGifs.length
                        ] : this.props.avatarImg
                    }
                    alt = "Avatar Image"
                    onClick = {this.toggleMessage} />
                {this.renderMyName()}
                {isStatic || this.state.wasMessaging ?
                    null :
                    <div
                        className = "header-banner"
                        key = {"NBannerKey" + this.state.index}
                        id = "current-banner">
                    {this.renderAnnouncement(true)}
                    </div>
                }
                <div 
                    className = {"header-banner" + (
                        this.state.isMessaging ?
                        " hidden" : ""
                    )}
                    key = {
                        "CBannerKey" + (
                            isStatic ?
                            this.state.index : this.state.newIndex
                        )
                    }
                    id = {
                        isStatic || this.state.wasMessaging ?
                        "static-banner" : "next-banner"
                    }>
                {this.renderAnnouncement()}
                </div>
                <div 
                    className = {"header-banner" + (
                        this.state.isMessaging ? 
                        "" : " hidden"
                    )}
                    id = "message-banner">
                    <MessageForm 
                        message = {this.state.message}
                        messageStatus = {this.state.messageStatus}
                        onChange = {this.editMessage}
                        onSend = {this.sendMessage}
                        onCancel = {this.cancelMessage} />
                </div>
                {this.renderSelectionBar()}
            </div>
        );
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
        return (
            <form id = "message-form">
                <textarea
                    id = "message-textarea"
                    value = {this.props.message}
                    placeholder = "[Enter Message Here] (Please provide your contact information if you want a response)"
                    maxlength = {maxLength}
                    onChange = {this.editText}>
                </textarea>
                <button
                    className = "form-button"
                    id = "message-sendbutton"
                    onClick = {this.props.onSend}>
                Send
                </button>
                <button
                    className = "form-button"
                    id = "message-cancelbutton"
                    onClick = {this.props.onCancel}>
                Cancel
                </button>
                <span 
                    key = {this.props.messageStatus}
                    className = {
                        "message-status " + this.props.messageStatus
                    }>
                {this.getStatus()}
                </span>
                <span 
                    className = {"count" + (
                        this.props.message.length < maxLength ?
                        "" : " maximum"
                    )}>
                {this.props.message.length} / {maxLength}
                </span>
            </form>
        );
    }
}
