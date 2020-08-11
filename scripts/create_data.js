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
    let name = "about.js";
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
    let name = "sample.js";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function project1() {
    let name = "projects.js";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function contact() {
    let name = "contact.js";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function gameIntro1() {
    let name = "game_intro1.js";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function gameIntro2() {
    let name = "game_intro2.js";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

function gameIntro3() {
    let name = "game_intro3.js";
    let data = {};
    data.text = [];
    data.links = {
    };
    return [data, name];
}

[data, filename] = about();
