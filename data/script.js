// var gyroDict = {'gyroX': 0.0, 'gyroY': 0.0, 'gyroZ': 0.0};
var websocket = null;
var localhost = "";
// const status_line = document.getElementById('status_lbl');
var isConnectedToBox = false;

const pages = document.querySelectorAll(".screen");
const translateAmount = 100;
let translate = 0;

const passkey_txtbox = document.getElementById("passkey_txtbox");
const welcome_screen = document.getElementById("welcome-screen");
const neopixel_screen = document.getElementById("neopixel-screen");
const first_strip = document.getElementById("first-strip");
const second_strip = document.getElementById("second-strip");
const third_strip = document.getElementById("third-strip");
const neopixel_screen_text = document.getElementById("color-list");
const neopixel_screen_neosText = document.getElementById("neos-color");
const victory_vid = document.getElementById("victory-vid");
// const box_down_screen = document.getElementById("box-down-screen");

var completed_puzzles = [];

var box_curr_puzz = 0;
var current_puzzle = 0; //box starts at 1
const puzzleOrder = { 0: 'key_lbl', 1: 'maze_lbl', 2: 'neo_lbl', 3: 'knobs_lbl', 4: 'weights_lbl', 5: 'dark_lbl', 6: 'tilt_lbl', 7: 'final_lbl' };
const element_ids = ["key_lbl", "maze_lbl", "knobs_lbl", "weights_lbl", "tilt_lbl", "dark_lbl", "neo_lbl", "door_lbl", "final_lbl"];

const passkey = "jo";
var adminPanelEnabled = true;
let showAdmin = false;

const colorList = ['pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white'];
var colorOrderNum = 0;
const colorNum = 4; //must also change this in server.cpp

var light_order = [];

let walls = ["graveyard", "twilight", "stairs"];
let light_phrases = ["It's too dark to see the name on the coffin", "I can barely see what's howling", "I need more light to see what's on the stairs"];
let dark_phrases = ["I can only visit the dead at night", "Protect the vampire from the sun", "Darkness can hide magic pumpkins"];

// Initialize the websocket
function init() {
    if (window.location.hostname != "") {
        localhost = window.location.hostname;
    }

    doConnect();
}

// Open Websocket as soon as page loads
window.addEventListener("load", init, false);

window.onload = function () {
    setupMaze();
    set_dial_speed(1);
};

window.onresize = function () {
    return;
    let viewbox = document.querySelector("#maze_box");
    let viewWidth = viewbox.offsetWidth;
    let viewHeight = viewbox.offsetHeight;
    if (viewHeight < viewWidth) {
        mazeCtx.canvas.width = viewHeight - viewHeight / 100;
        mazeCtx.canvas.height = viewHeight - viewHeight / 100;
    } else {
        mazeCtx.canvas.width = viewWidth - viewWidth / 100;
        mazeCtx.canvas.height = viewWidth - viewWidth / 100;
    }
    cellSize = mazeCanvas.width / difficulty;
    if (player != null) {
        draw.redrawMaze(cellSize);
        player.redrawPlayer(cellSize);
    }
};

passkey_txtbox.addEventListener("input", (event) => {
    if (event.target.value === passkey) {
        event.target.value = "";
        passkey_completed();
    }
});

const passkey_completed = () => {
    set_light_order();
    slide();
    setTimeout(() => {
        // box_down_screen.style.opacity = 1;
        slide();
    }, 1000);
    puzzle_complete("");
}

function toggleAdminPanel() {
    if (!adminPanelEnabled) {
        let adminName = prompt("This puzzle box was created by Chibu, Haris, and Chele for EE327 Spring 2023. ;)\nName?");
        if (adminName != "ilya") {
            if (adminName != null) {
                alert("Hi " + adminName + "! Have fun!");
            }
            return;
        } else {
            adminPanelEnabled = true;
        }
    }
    if (showAdmin) {
        //if showing, hide
        document.getElementById("puzzles-container").style.width = "45px";
        document.getElementById("main-game").style.marginLeft = "0px";
        showAdmin = false;
    } else {
        //if not, show
        const move = "300px";
        document.getElementById("puzzles-container").style.width = move;
        document.getElementById("main-game").style.marginLeft = move;
        showAdmin = true;
    }
}

const slide = (direction = 1, skip = 1) => {
    if (direction === 1) {
        translate -= translateAmount * skip;
    } else if (direction === -1) {
        translate += translateAmount * skip;
    }

    pages.forEach(
        pages => (pages.style.transform = `translateX(${translate}%)`)
    );

    document.getElementById("skipBtn").disabled = false;
}

function updatePage(num, data) {
    // strike off list
    Object.keys(puzzleOrder).slice(0, num).map((i) => {
        document.getElementById(puzzleOrder[i]).classList.add("strike");
    });

    const puzzleLbl = puzzleOrder[num];

    console.log(`from box: puzzle ${num}, ${puzzleLbl}`);

    // const puzzleOrder = {0: 'key_lbl', 1: 'maze_lbl', 2: 'neo_lbl', 3: 'knobs_lbl', 4: 'weights_lbl', 5: 'dark_lbl', 6: 'tilt_lbl', 7: 'final_lbl'};
    // num comes from the box itself, 0 would be the password
    switch (puzzleLbl) {
        case 'maze_lbl':
            // maze - web tells box that it's completed
            // box gives acceleration data
            updateDirection(data);
            break;
            // neopixel screen set when completed
        case 'neo_lbl':
            //neopixels - box tells web when completed
            document.getElementById("admin-btn").style.color = "black";
            if (data === "completed") {
                showLightNums(); // don't want to slide
                let light_string = `${light_order.indexOf(1)}${light_order.indexOf(2)}${light_order.indexOf(3)}`;
                puzzle_complete(light_string); // for knob puzzle
            }
            break;
        case 'knobs_lbl':
            // lights - box tells web that it's completed
            if (data === "completed") {
                setupSkyline();
                slide();
                puzzle_complete();
            }
            break;
        case 'weights_lbl':
            // weights1/keypad - box tells web that it's completed
            updateWeight(data);
            break;
        case 'dark_lbl':
            // photoresistors  - box tells web that it's completed
            // box gives web photoresistor status
            // reveal first half
            if (data === "halfway") {
                document.getElementById("lightside").style.background = "white";
                document.getElementById("lightside-clue").style.color = "black";
                document.getElementById("darkside-clue").style.color = "black";
            } else if (data === "continue") { // reveal second half
                document.getElementById("lightside-clue").style.color = "white";
                document.getElementById("darkside").style.background = "black";
            } else if (data === "completed") {
                // box then tells web when all potentiometers turned down
                let sol_num = setKnobImage(); //for tilt puzzle
                sendMessage('info', 6, sol_num); // send data for puzzle 6
                slide();
            } else {
                //the clue numbers
                console.log(data);
                set_ldr_clue(Number(data[0]), Number(data[1]));
            }
            break;
        case 'tilt_lbl':
            // tilt - web tells box that it's completed
            // box gives acceleration data
            if (data === "completed") {
                slide();
            } else {
                updateRotation(data);
            }
            break;
        case 'final_lbl':
            //finale - box tells web when completed
            document.getElementById("skipBtn").disabled = true;
            if (data === "completed") {
                // slide();
            }
            break;
        default:
            break;
    }

}

function skipPuzzle() {
    // const puzzleOrder = {0: 'key_lbl', 1: 'maze_lbl', 2: 'neo_lbl', 
    // 3: 'knobs_lbl', 4: 'weights_lbl', 5: 'dark_lbl', 6: 'tilt_lbl', 7: 'final_lbl'};
    const puzzleLbl = puzzleOrder[current_puzzle];
    document.getElementById("skipBtn").disabled = true;
    sendMessage('skip', current_puzzle);
    console.log("skipping", current_puzzle, puzzleLbl);

    switch (puzzleLbl) {
        case 'key_lbl':
            passkey_completed();
            console.log("skipping password");
            break;
        case 'maze_lbl':
            console.log("skipping maze");
            // neo pixel screen set when maze complete
            setMazeComplete();
            break;
        case 'neo_lbl':
            console.log("skipping neos");
            showLightNums(); // don't want to slide
            let light_string = `${light_order.indexOf(1)}${light_order.indexOf(2)}${light_order.indexOf(3)}`;
            if (!isConnectedToBox) {
                puzzle_complete();
            } else {
                puzzle_complete(light_string); // for knob puzzle
            }
            document.getElementById("skipBtn").disabled = false;
            break;
        case 'knobs_lbl':
            console.log("skipping lights");
            if (!isConnectedToBox) {
                setupSkyline();
                slide();
                puzzle_complete();
            }
            break;
        case 'weights_lbl':
            console.log("skipping weight");
            setSkylineComplete();
            break;
        case 'dark_lbl':
            console.log("skipping dark/light");
            document.getElementById("lightside").style.background = "white";
            document.getElementById("lightside-clue").style.color = "black";
            document.getElementById("lightside-clue").style.color = "white";
            document.getElementById("darkside").style.background = "black";
            if (!isConnectedToBox) {
                slide();
                puzzle_complete();
            }
            break;
        case 'tilt_lbl':
            console.log("skipping tilt");
            if (!isConnectedToBox) {
                slide();
                puzzle_complete();
            }
            break;
        case 'final_lbl':
            //finale - box tells web when completed
            // console.log("skipping finale");
            // if (!isConnectedToBox) {
            //     slide();
            //     puzzle_complete();
            // }
            document.getElementById("skipBtn").disabled = true;
            break;
        default:
            break;
    }

    console.log(puzzleOrder);
    Object.keys(puzzleOrder).slice(0, current_puzzle).map((i) => {
        document.getElementById(puzzleOrder[i]).classList.add("strike");
    });
}

function set_light_order() {
    //get numbers for sides of box
    for (i = 0; i < 3; i++) {
        // Returns a random integer from 1 to 4 (inclusive):
        let r_int = Math.floor(Math.random() * 4) + 1;
        while (light_order.includes(r_int)) {
            r_int = Math.floor(Math.random() * 4) + 1;
        }
        light_order.push(r_int);
    }

    console.log(light_order.toString());
}

function set_ldr_clue(light_ldr, dark_ldr) {
    console.log(walls[light_ldr], walls[dark_ldr]);
    document.getElementById("lightside-clue").innerHTML = light_phrases[light_ldr];
    document.getElementById("darkside-clue").innerHTML = dark_phrases[dark_ldr];
}

function setKnobImage() {
    let sol_image = document.getElementById("knob-img");
    let image_choice = Math.floor(Math.random() * 2) + 1;
    switch (image_choice) {
        case 1:
            sol_image.src = "sol1.png"
            break;
        case 2:
            sol_image.src = "sol2.png"
            break;
        case 3:
            sol_image.src = "sol3.png"
            break;
        default:
            break;
    }
    return image_choice;
}

function setNeoPixelScreen() {
    const colorOrder1 = setColorOrder();
    const colorOrder2 = setColorOrder();
    const colorOrder3 = setColorOrder();
    console.log(colorOrder1, colorOrder2, colorOrder3);
    let [css_gradient1, htmlText1] = createGradient(colorOrder1);
    let [css_gradient2, htmlText2] = createGradient(colorOrder2);
    let [css_gradient3, htmlText3] = createGradient(colorOrder3);
    // console.log(css_gradient1, css_gradient2, css_gradient3);
    first_strip.style.background = css_gradient1;
    second_strip.style.background = css_gradient2;
    third_strip.style.background = css_gradient3;
    first_strip.innerHTML = htmlText1;
    second_strip.innerHTML = htmlText2;
    third_strip.innerHTML = htmlText3;
    //jank way
    let colorOrderString = "";
    const colorOrdersList = [colorOrder1, colorOrder2, colorOrder3];
    for (i = 0; i < colorOrder1.length; i++) {
        colorOrderString += (colorOrdersList[colorOrderNum][i] + 1).toString();
    }
    console.log("sending", colorOrderString);
    // let colorOrderString = colorOrder.slice(0, colorNum).toString().replace(/,/g, "")
    const neoPuzzleNum = Object.values(puzzleOrder).indexOf('neo_lbl'); // 2
    sendMessage('info', neoPuzzleNum, colorOrderString);
}

function showLightNums() {
    first_strip.innerHTML = light_order[0];
    second_strip.innerHTML = light_order[1];
    third_strip.innerHTML = light_order[2];
}

function setColorOrder() {
    // let colorIndexes = new Set();
    let colorIndexes = [];
    while (colorIndexes.length < colorList.length) {
        let randomIndex = Math.floor(Math.random() * colorList.length);
        // if (!colorIndexes.has(randomIndex)) {
            // colorIndexes.add(randomIndex);
            colorIndexes.push(randomIndex);
        // }
    }
    // return [...colorIndexes]; //return list
    return colorIndexes;
}

function createGradient(colorOrder) {
    let css = "linear-gradient(to right,";
    let percent = 0;
    let percent_inc = 100 / colorOrder.length;
    let htmlText = "";

    colorOrder.forEach((colorIndex, index) => {
        css += colorList[colorIndex] + " " + percent + "%";
        percent += percent_inc;
        css += " " + percent;
        htmlText += colorList[colorIndex];
        if (index === colorOrder.length - 1) {
            css += "%";
        } else {
            css += "%,";
            htmlText += " - "
        }
    });

    css += ")";
    console.log(htmlText);
    return [css, htmlText];
}

function onRecalibrate() {
    sendMessage('recalibrate', current_puzzle);
}

// used in maze and skyline
// gets random int
function rand(max, includesZero=0) {
    return Math.floor(Math.random() * max) + includesZero*1;
}

// function toggleVisibility(id) {
//     if (document.getElementById(id).style.visibility == "visible") {
//         document.getElementById(id).style.visibility = "hidden";
//         makeMaze();
//         websocket.send("completed");
//     } else {
//         document.getElementById(id).style.visibility = "visible";
//     }
// }

// function random_item(items) {
//     return items[Math.floor(Math.random() * items.length)];
// }

// function pauseNeos() {
//     websocket.send(`info61`);
//     document.getElementById("pause-btn").disabled = true;
//     setTimeout(() => {
//         websocket.send(`info60`);
//         document.getElementById("pause-btn").disabled = false;
//     }, 3000);
// }

// function unlockDoor() {
//     document.getElementById("center-door-div").style.height = 0;
// }