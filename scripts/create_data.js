/* 
 * creates .json files that serve as the source for
 * LinkEmbedText React components.
 *
 * The format of stored .json object should be:
 *
 * {
 *     text: [
 *         "[contents] (use {} as placeholder for links)",
 *         "[contents] (use {} as placeholder for links)",
 *         ...
 *     ],
 *     links: {
 *         [keyword1]: [src1],
 *         [keyword2]: [src2],
 *         [keyword3]: [src3],
 *         ...
 *     },
 * }
 *
 */
function about() {
    let name = "about.json";
    let data = {};
    data.text = [
        "click {here} to view image",
        "more texts",
    ];
    data.links = {
        "here" : "resources/Images/bg1.jpg"
    };
    return [data, name];
}

function sample() {
    let name = "sample.json";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function project1() {
    let name = "projects.json";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function contact() {
    let name = "contact.json";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function minesweeperIntro() {
    let name = "minesweeperIntro.json";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function snakeIntro() {
    let name = "snakeIntro.json";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function cartpoleIntro() {
    let name = "cartpoleIntro.json";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

let f = about;
[data, filename] = f();
