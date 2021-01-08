fetch("resources/JSON/Site/setup.json").
    then(
        response => {
            if ( response.ok ) {
                return response.json();
            } else {
                throw new Error("http server error"); 
            }
        }
    ).then(
        jsonData => {
            ReactDOM.render(
                <MainPage 
                    data = {jsonData} 
                    globalFillers = {fillers} />,
                document.getElementById("root"),
            );
        },
        err => {
            ReactDOM.render(
                <MainPage data = {err} />,
                document.getElementById("root"),
            );
        },
    );
