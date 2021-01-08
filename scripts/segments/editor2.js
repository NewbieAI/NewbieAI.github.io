class Article extends React.Component {
    constructor(props) {
        super(props);
        this.renderElement = this.renderElement.bind(this);
    }

    renderTitle(title) {
        if (title == "") {
            return null;
        }
        return <h1 className = "title">{title}</h1>;
    }

    renderAuthors(authors) {
        if (authors.length == 0) {
            return null;
        }
        return (
            <h4 className = "author">
            {authors.map(
                (author, index, arr) => {
                    if (index == 0) {
                        return "by " + author;
                    } else if (index + 1 == arr.length) {
                        return " and " + author;
                    }
                    return " " + author;
                }
            ).join()}
            </h4>
        );
    }

    renderDate(creationDate, lastModified) {
        if (creationDate == "") {
            return null;
        }
        return (
            <h4 className = "date">
            {creationDate} (last edited {lastModified})
            </h4>
        );
    }
    
    renderTextElement(element) {
        function buildParagraph(p) {
            if ( codeMatcher.test(p) ) {
                let codeSrc = p.match(codeMatcher)[1];
                return <Code src = {codeSrc}/>
            }
            let arr = p.split( splitter );
            console.log(arr);
            return (
                <p className = {element.indented ? "indented" : null}>
                {arr.map(
                    s => {
                        if ( linkMatcher.test(s) ) {
                            console.log("link detected");
                            return buildLink(s);
                        }
                        if ( boldMatcher.test(s) ) {
                            return <b>{s.match(boldMatcher)[1]}</b>;
                        }
                        if ( italicMatcher.test(s) ) {
                            return <i>{s.match(italicMatcher)[1]}</i>;
                        }
                        if ( delMatcher.test(s) ) {
                            return <del>{s.match(delMatcher)[1]}</del>;
                        }
                        if ( insMatcher.test(s) ) {
                            return <ins>{s.match(insMatcher)[1]}</ins>;
                        }
                        if ( supMatcher.test(s) ) {
                            return <sup>{s.match(supMatcher)[1]}</sup>;
                        }
                        if ( subMatcher.test(s) ) {
                            return <sub>{s.match(subMatcher)[1]}</sub>;
                        }
                        if ( inlineMatcher.test(s) ) {
                            return <code>{s.match(inlineMatcher)[1]}</code>;
                        }
                        return s;
                    }
                )}
                </p>
            );
        }

        function buildLink(s) {
            const t = s.slice(1, s.length - 1);
            let link, clicker, target;
            if (element.links[t] == undefined) {
                link = "#";
                clicker = () => {
                    return false;
                };
                target = null;
            } else if ( internalLink.test( element.links[t] ) ) {
                link  = "#";
                clicker = () => {
                    let pathString = element.links[t].match(
                        internalLink
                    )[1];
                    alert("internal link: " + pathString);
                    return false;
                }
                target = null;
            } else {
                link = element.links[t];
                clicker = null;
                target = "_blank";
            }
            return (
                <a
                    href = {link}
                    onClick = {clicker}
                    target = {target} >
                {t}
                </a>
            );
        }

        let paragraphs = element.content.split(/\n+/);
        const splitter = /(\^[\d\s\w]+\^|\^\^[\d\s\w]+\^\^|\*[\d\s\w]+\*|\*\*[\d\s\w]+\*\*|~[\d\s\w]+~|~~[\d\s\w]+~~|<<[^<>]+>>|{[\d\s\w]+})/g;
        const linkMatcher = /^{[\d\s\w]+}$/;
        const boldMatcher = /^\*\*([\d\s\w]+)\*\*$/;
        const italicMatcher = /^\*([\d\s\w]+)\*$/;
        const delMatcher = /^~~([\d\s\w]+)~~$/;
        const insMatcher = /^~([\d\s\w]+)~$/;
        const supMatcher = /^\^([\d\w\s]+)\^$/;
        const subMatcher = /^\^\^([\d\s\w]+)\^\^$/;
        const inlineMatcher = /^<<([^<>]+)>>$/;
        const codeMatcher = /^<(.*)>$/;
        const internalLink = /^internal::(.*)$/;
        return (
            <div className = "text">
            {paragraphs.map( buildParagraph )}
            </div>
        );
    }

    renderImageElement(element) {
        let caption;
        if (element.name || element.caption) {
            const sep = (
                (element.name == "" || element.caption == "") ?
                "" : ": "
            );
            caption = (
                <div className = "caption">
                    <span className = "caption-text">
                        <b> {element.name + sep} </b>
                        {element.caption}
                    </span>
                </div>
            );
        } else {
            caption = null;
        }
        return (
            <div 
                className = "image-element" >
                <div className = "image-container">
                    <div className = "figure">
                        <img 
                            width = {element.width || null}
                            height = {element.height || null}
                            src = {element.src}
                            alt = "Image failed to load" />
                    </div>
                    {caption}
                </div>
            </div>
        );
    }

    renderQuoteElement(element) {
        return (
            <div className = "quote">
                <p className = "quote-text">
                    <i>{"\u201c" + element.text + "\u201d"}</i>
                </p>
                <span className = "quote-source">
                {element.src == "" ?  null : "\u2014 " + element.src}
                </span>
            </div>
        );
    }

    renderSubtitleElement(element) {
        return (
            <h3 className = "subtitle">
            {element.text}
            </h3>
        );
    }

    renderElement(element) {
        switch (element.type) {
            case "text":
                return this.renderTextElement(element);
            case "image":
                return this.renderImageElement(element);
            case "quote":
                return this.renderQuoteElement(element);
            case "subtitle":
                return this.renderSubtitleElement(element);
            default:
                return null;
        }
    }

    render() {
        return (
            <div id = "article">
                {this.renderTitle(this.props.data.title)}
                {this.renderAuthors(this.props.data.authors)}
                {this.renderDate(
                    this.props.data.creationDate, 
                    this.props.data.lastModified,
                )}
                {this.props.data.components.map(this.renderElement)}
            </div>
        );
    }
}
