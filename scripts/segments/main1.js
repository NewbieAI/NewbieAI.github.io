class Article extends React.Component {
    constructor(props) {
        super(props);
        //...
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

    render() {
        //...
    }
}
