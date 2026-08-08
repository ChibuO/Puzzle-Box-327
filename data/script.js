// var gyroDict = {'gyroX': 0.0, 'gyroY': 0.0, 'gyroZ': 0.0};
let websocket = null;
let localhost = "";
// const status_line = document.getElementById('status_lbl');
let isConnectedToBox = false;

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

// light page
const light_lightside = document.getElementById("lightside");
const light_lightside_clue = document.getElementById("lightside-clue");
const light_darkside = document.getElementById("darkside");
const light_darkside_clue = document.getElementById("darkside-clue");

let box_curr_puzz = 0;
let current_puzzle = 0; //box starts at 1
const puzzleOrder = { 0: 'key_lbl', 1: 'maze_lbl', 2: 'neo_lbl', 3: 'knobs_lbl', 4: 'weights_lbl', 5: 'dark_lbl', 6: 'tilt_lbl', 7: 'turn_lbl', 8: 'final_lbl' };
const element_ids = ["key_lbl", "maze_lbl", "knobs_lbl", "weights_lbl", "tilt_lbl", "dark_lbl", "neo_lbl", "turn_lbl", "final_lbl"];

const passkey = "jo";
let codeString = "";
const code = setCode();
let adminPanelEnabled = true;
let showAdmin = false;

const colorList = ['pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white'];
let colorOrderNum = 0;
const colorNum = 4; //must also change this in server.cpp

let light_order = [];
let light_string = "";
let box_down_timer = 2;

let isDialsCompleted = false;

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
    createDials();
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
    if (event.target.value === codeString || event.target.value === passkey) {
        event.target.value = "";
        passkey_completed();
    }
});

const passkey_completed = () => {
    set_light_order();
    slide();
    
    // Start countdown from 5
    let countdown = box_down_timer;
    document.getElementById("box-down-timer").innerHTML = countdown;
    const timerInterval = setInterval(() => {
        countdown--;
        document.getElementById("box-down-timer").innerHTML = countdown;
        if (countdown <= 0) {
            clearInterval(timerInterval);
            slide();
        }
    }, 1000);
    
    puzzle_complete(""); // 0 -> 1
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

    console.log(`from box: puzzle ${num}, ${puzzleLbl}`, data);

    // const puzzleOrder = {0: 'key_lbl', 1: 'maze_lbl', 2: 'neo_lbl', 3: 'knobs_lbl', 4: 'weights_lbl', 5: 'dark_lbl', 6: 'tilt_lbl', 7: 'turn_lbl', 8: 'final_lbl'};
    // num comes from the box itself, 0 would be the password
    switch (puzzleLbl) {
        case 'maze_lbl':
            // maze - web tells box that it's completed
            // box gives acceleration data
            updateDirection(data); // 1 -> 2
            break;
            // neopixel screen set when completed
        case 'neo_lbl':
            //neopixels - box tells web when completed
            document.getElementById("admin-btn").style.color = "black";
            if (data === "completed") {
                showLightNums(); // don't want to slide
                console.log(light_string);
                // sendMessage('info', 3, light_string); // send data for knob puzzle (3)
                puzzle_complete(light_string); // 2 -> 3
                console.log("neos completed")
                setupSkyline();
            }
            break;
        case 'knobs_lbl':
            // lights - box tells web that it's completed
            if (data === "completed") {
                console.log("knobs completed");
                puzzle_complete(); // 3 -> 4
                slide();
            }
            break;
        case 'weights_lbl':
            // weights/keypad - box tells web that it's completed
            updateWeight(data); // 4 -> 5
            break;
        case 'dark_lbl':
            // photoresistors - box tells web that it's completed
            // box gives web photoresistor status
            // reveal first half
            if (data === "halfway") {
                light_lightside.style.background = "var(--lightside-color)";
                light_lightside_clue.style.color = "var(--darkside-color)";
                light_darkside_clue.style.color = "var(--darkside-color)";
            } else if (data === "continue") { // reveal second half
                light_lightside_clue.style.color = "var(--lightside-color)";
                light_darkside.style.background = "var(--darkside-color)";
            } else if (data === "completed") {
                // box then tells web when all potentiometers turned down
                let sol_num = setKnobImage(); //for tilt puzzle
                // sendMessage('info', 6, sol_num); // send data for puzzle 6
                puzzle_complete(sol_num); // 5 -> 6
                slide();
            } else {
                //the clue numbers
                console.log(data);
                set_ldr_clue(Number(data[0]), Number(data[1]));
            } // 5 -> 6
            break;
        case 'tilt_lbl':
            // tilt - web tells box that it's completed
            // box gives acceleration data
            updateRotation(data); // 6 -> 7
            break;
        case 'turn_lbl':
            //finale - box tells web when completed
            // if (isDialsCompleted) {
            //     document.getElementById("skipBtn").disabled = true;
            // }
            if (data === "completed") {
                slide();
                document.getElementById("skipBtn").disabled = true;
            }
            break;
        default:
            break;
    }

}

function skipPuzzle() {
    // const puzzleOrder = {0: 'key_lbl', 1: 'maze_lbl', 2: 'neo_lbl', 
    // 3: 'knobs_lbl', 4: 'weights_lbl', 5: 'dark_lbl', 6: 'tilt_lbl', 7: 'turn_lbl', 8: 'final_lbl'};
    const puzzleLbl = puzzleOrder[current_puzzle];
    document.getElementById("skipBtn").disabled = true; // gets set to true in slide()
    sendMessage('skip', current_puzzle);
    console.log("skipping", current_puzzle, puzzleLbl);

    switch (puzzleLbl) {
        case 'key_lbl':
            passkey_completed(); // 0 -> 1
            console.log("skipping password");
            break;
        case 'maze_lbl':
            console.log("skipping maze");
            // neo pixel screen set when maze complete
            setMazeComplete(); // 1 -> 2
            break;
        case 'neo_lbl':
            console.log("skipping neos");
            showLightNums(); // don't want to slide
            if (!isConnectedToBox) {
                puzzle_complete();
            } else {
                console.log(light_string);
                puzzle_complete(light_string); // for knob puzzle, 2 -> 3
            }
            document.getElementById("skipBtn").disabled = false;
            setupSkyline();
            break;
        case 'knobs_lbl':
            console.log("skipping lights");
            slide();
            puzzle_complete();
            break;
        case 'weights_lbl':
            console.log("skipping weight");
            setSkylineComplete();
            if (!isConnectedToBox) {
                set_ldr_clue(0, 1);
            }
            break;
        case 'dark_lbl':
            console.log("skipping dark/light");
            light_lightside.style.background = "var(--lightside-color)";
            light_lightside_clue.style.color = "var(--darkside-color)";
            // if connected to box, need to wait for knobs off
            if (!isConnectedToBox) {
                setKnobImage(); //for tilt puzzle
                light_lightside_clue.style.color = "var(--lightside-color)";
                light_darkside.style.background = "var(--darkside-color)";
                slide();
                puzzle_complete();
            }
            // if (isConnectedToBox) {
                // let sol_num = setKnobImage(); //for tilt puzzle
            //     sendMessage('info', 6, sol_num); // send data for puzzle 6
            // } else {
                
            // }
            
            break;
        case 'tilt_lbl':
            console.log("skipping tilt");
            setDialsComplete();
            document.getElementById("skipBtn").disabled = false;
            break;
        case 'turn_lbl':
            //finale - box tells web when completed
            // console.log("skipping finale");
            // if (!isConnectedToBox) {
            //     slide();
            //     puzzle_complete();
            // }
            slide();
            puzzle_complete();
            document.getElementById("skipBtn").disabled = true;
            break;
        default:
            break;
    }

    // console.log(puzzleOrder);
    Object.keys(puzzleOrder).slice(0, current_puzzle).map((i) => {
        document.getElementById(puzzleOrder[i]).classList.add("strike");
    });
}

function set_light_order() {
    //get numbers for sides of box, 3 nums
    for (i = 0; i < 3; i++) {
        // Returns a random integer from 1 to 3 (exclusive):
        let r_int = rand(0, 3, false);
        while (light_order.includes(r_int)) {
            r_int = rand(0, 3, false);
        }
        light_order.push(r_int);
    }
    light_string = `${light_order.indexOf(0)}${light_order.indexOf(1)}${light_order.indexOf(2)}`;
}

function set_ldr_clue(light_ldr, dark_ldr) {
    console.log(walls[light_ldr], walls[dark_ldr]);
    light_lightside_clue.innerHTML = light_phrases[light_ldr];
    light_darkside_clue.innerHTML = dark_phrases[dark_ldr];
}

function setKnobImage() {
    let sol_image = document.getElementById("knob-img");
    let image_choice = rand(1, 3, 1);
    switch (image_choice) {
        case 1:
            sol_image.src = "sol1.png"
            sol_image.alt = "knob 1";
            break;
        case 2:
            sol_image.src = "sol2.png"
            sol_image.alt = "knob 2";
            break;
        case 3:
            sol_image.src = "sol3.png"
            sol_image.alt = "knob 3";
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
    [first_strip, second_strip, third_strip].forEach(strip => {
        strip.style.background = "white";
    });
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
    htmlText = "::" + htmlText + "::";
    return [css, htmlText];
}

function onRecalibrate() {
    sendMessage('recalibrate', current_puzzle);
}

// used in maze and skyline
// gets random int
function rand(min, max, maxInclusive=false) {
    return Math.floor(Math.random() * (max - min + maxInclusive) + min);
}

function setCode() {
    const firstNum = rand(1, 30, 1);
    const secondNum = rand(1, 30, 1);
    const thirdNum = rand(1, 30, 1);
    const codeList = [firstNum, secondNum, thirdNum];
    codeString = codeList.reduce((output, num) => {
        const formattedNum = num < 10 ? `0${num}` : `${num}`;
        return output + formattedNum;
    }, '');
    return codeList;
}
