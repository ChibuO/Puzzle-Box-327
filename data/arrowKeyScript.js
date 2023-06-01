var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
var ballSprite;
var goalSprite;
var maze, draw, player;
var cellSize;
var difficulty;
var accelDict = {'accX': 0.0, 'accY': 0.0, 'accZ': 0.0};
var gyroDict = {'gyroX': 0.0, 'gyroY': 0.0, 'gyroZ': 0.0};
var d_tilt;
var maze_completed = false;
var maze_interval_id;
var maze_wall_color = "white";


var websocket = null;
var localhost = "";
var status_line = document.getElementById('status_lbl');
var webcam_closed = false;

var passkey = "jo";
var adminPanelEnabled = true;
let showAdmin = false;

const pages = document.querySelectorAll(".screen");
const translateAmount = 100;
let translate = 0;

const passkey_txtbox = document.getElementById("passkey_txtbox");
let welcome_screen = document.getElementById("welcome-screen");
let box_down_screen = document.getElementById("box-down-screen");

var light_order = [];

var completed_puzzles = [];

var current_puzzle = 0;

var mesg_received = false;

let prev_num = 0;
let curr_num = 0;

function updateDirection(data) {
    //on maze puzzle
    let accelArray = data.split(" ").map(parseFloat);
    // console.log(accelArray);
    accelDict['accX'] = accelArray[0];
    accelDict['accY'] = accelArray[1];
    accelDict['accZ'] = accelArray[2];
    // console.log(accelDict);
    direction_tilt();
}

function update_list(num, data) {
    let element_ids = ["key_lbl", "maze_lbl", "knobs_lbl", "weights_lbl", "tilt_lbl", "dark_lbl", "neo_lbl", "door_lbl","final_lbl"];
    element_ids.slice(0, num+1).map((i) => {
        document.getElementById(i).classList.add("strike");
    });

    switch(current_puzzle) {
        case 0:
            //password - web tells box that it's completed
            if (data === "boxdown") {
                slide();
            }
            break;
        case 1:
            //maze - web tells box that it's completed
            //box gives acceleration data
            updateDirection(data);
            if (data === "boxdown") {
                slide(1, 2);
            }
            break;
        case 2:
            //lights - box tells web that it's completed
            if (data === "completed") {
                slide();
            }
            break;
        case 3:
            //fractions - box tells web that it's completed
            if (data === "completed") {
                slide();
            }
            break;
        case 4:
            //tilt - web tells box that it's completed
            // updateDirection(data);
            if (data === "boxdown") {
                slide();
            }
            break;
        case 5:
            //photoresistors  - web tells box that ot's completed
            //box gives web photoresistor data
            // updatePhotos(data);
            //box then tells web when all potentiometers turned down
            if (data === "completed") {
                slide();
            }
            break;
        case 6:
            //neopiixels - box tells web when completed
            if (data === "completed") {
                slide();
            }
            break;
        case 7:
            //neopiixels - box tells web when completed
            if (data === "completed") {
                slide();
            }
            break;
        case 8:
            //finale - box tells web when completed
            if (data === "completed") {
                slide();
            }
            break;
        default:
            break;
    }
    
}

// Initialize the websocket
function init() {
	if (window.location.hostname != "") {
		localhost = window.location.hostname;
	}

	doConnect();
}

function doConnect() { // makes a connection and defines callbacks
    writeToScreen("Connecting to ws://" + localhost + ":81/ ...");
    websocket = new WebSocket("ws://" + localhost + ":81/");
    websocket.onopen = function(evt) {
        onOpen(evt)
    };
    websocket.onclose = function(evt) {
        onClose(evt)
        webcam_closed = true;
    };
    websocket.onmessage = function(evt) {
        onMessage(evt)
    };
    websocket.onerror = function(evt) {
        onError(evt)
    };
}

function onOpen(evt) { // when handshake is complete:
	writeToScreen("Connected.");
}

function onClose(evt) { // when socket is closed:
	writeToScreen("Disconnected. Error: " + evt);
}

function onMessage(msg) {
    // let accelArray = msg.data.split(", ");
    // //console.log(accelArray);
    // accelDict['accX'] = accelArray[0];
    // accelDict['accY'] = accelArray[1];
    // accelDict['accZ'] = accelArray[2];
    // //console.log(accelDict);
    // direction_tilt();
    // console.log(msg.data);
    var obj = JSON.parse(msg.data);
    prev_num = curr_num;
    curr_num = Number(obj.completed);
    update_list(Number(obj.completed), obj.data);
}

function onError(evt) { // when an error occurs
	websocket.close();
	writeToScreen("Websocket error");
}

window.onload = function () {
    let viewbox = document.querySelector("#maze_box");
    let viewWidth = viewbox.offsetWidth;
    let viewHeight = viewbox.offsetHeight;
    console.log(viewHeight);
    console.log(viewWidth);
    if (viewHeight < viewWidth) {
        ctx.canvas.width = viewHeight - viewHeight / 100;
        ctx.canvas.height = viewHeight - viewHeight / 100;
    } else {
        ctx.canvas.width = viewWidth - viewWidth / 100;
        ctx.canvas.height = viewWidth - viewWidth / 100;
    }

    //Load and edit sprites
    var completeOne = false;
    var completeTwo = false;

    var isComplete = () => {
        if (completeOne === true && completeTwo === true) {
            console.log("Runs");
            setTimeout(function () {
                makeMaze();
            }, 500);
        }
    };

    ballSprite = new Image();
    ballSprite.src =
        "./key.png" +
        "?" +
        new Date().getTime();
    ballSprite.setAttribute("crossOrigin", " ");
    ballSprite.onload = function () {
        completeOne = true;
        console.log("Sprite 1 loaded");
        isComplete();
    };

    goalSprite = new Image();
    goalSprite.src = "./home.png" +
        "?" +
        new Date().getTime();
    goalSprite.setAttribute("crossOrigin", " ");
    goalSprite.onload = function () {
        completeTwo = true;
        console.log("Sprite 2 loaded");
        isComplete();
    };
    

};

window.onresize = function () {
    return;
    let viewbox = document.querySelector("#maze_box");
    let viewWidth = viewbox.offsetWidth;
    let viewHeight = viewbox.offsetHeight;
    if (viewHeight < viewWidth) {
        ctx.canvas.width = viewHeight - viewHeight / 100;
        ctx.canvas.height = viewHeight - viewHeight / 100;
    } else {
        ctx.canvas.width = viewWidth - viewWidth / 100;
        ctx.canvas.height = viewWidth - viewWidth / 100;
    }
    cellSize = mazeCanvas.width / difficulty;
    if (player != null) {
        draw.redrawMaze(cellSize);
        player.redrawPlayer(cellSize);
    }
};

function displayVictoryMessage() {
    slide(-1);
    maze_completed = true;
    setTimeout(() => {
        slide();
        if(maze_completed) {
            let light_num_divs = Array.from(document.getElementsByClassName("light-num-divs"));
            light_num_divs.forEach((div) => {
                div.style.opacity = "1";
            });
        }
    }, 1000);
    clearInterval(maze_interval_id);
    let light_string = `${light_order.indexOf(1)}${light_order.indexOf(2)}${light_order.indexOf(3)}${light_order.indexOf(4)}`;
    puzzle_complete(light_string);
}

function toggleVisibility(id) {
    if (document.getElementById(id).style.visibility == "visible") {
        document.getElementById(id).style.visibility = "hidden";
        makeMaze();
        websocket.send("completed");
    } else {
        document.getElementById(id).style.visibility = "visible";
    }
}

// Function to display to the message box
function writeToScreen(message)
{
  document.getElementById("status_lbl").innerHTML = message;
}

// Open Websocket as soon as page loads
window.addEventListener("load", init, false);

passkey_txtbox.addEventListener("input", (event) => {
    if(event.target.value === passkey) {
        // welcome_screen.style.opacity = 0;
        event.target.value = "";
        set_light_order();
        slide();
        setTimeout(() => {
            // box_down_screen.style.opacity = 1;
            slide();
        }, 1000);
        puzzle_complete();
    }
});

function direction_tilt() {
    if (accelDict['accY'] < -40.0) {
        d_tilt = "west";
    } else if (accelDict['accY'] > 30.0) {
        d_tilt = "east";
    } else if (accelDict['accX'] < -30.0) {
        d_tilt = "north";
    } else if (accelDict['accX'] > 45.0) {
        d_tilt = "south";
    } else {
        d_tilt = "none";
    }

    //console.log(d_tilt);
}

function toggleAdminPanel() {
    if(!adminPanelEnabled) {
        let adminName = prompt("This puzzle box was created by Chibu, Haris, and Chele for EE327 Spring 2023. ;)\nName?");
        if (adminName != "ilya") {
            if(adminName != null) {
                alert("Hi " + adminName + "! Have fun!");
            }
            return;
        } else {
            adminPanelEnabled = true;
        }
    }
    if(showAdmin) {
        //if showing, hide
        document.getElementById("puzzles-container").style.width = "45px";
        document.getElementById("main-game").style.marginLeft = "0px";
        showAdmin = false;
    } else {
        //if not, show
        document.getElementById("puzzles-container").style.width = "28vw";
        document.getElementById("main-game").style.marginLeft = "28vw";
        showAdmin = true;
    }
}

function set_light_order() {
    let lights = [];
    //get numbers for sides of box
    for(i=0; i < 4; i++) {
        // Returns a random integer from 1 to 4:
        let r_int = Math.floor(Math.random() * 4) + 1;
        while (light_order.includes(r_int)) {
            r_int = Math.floor(Math.random() * 4) + 1;
        }
        light_order.push(r_int);
        lights.push(r_int);
    }
    
    console.log(lights);
    
    let light_num_lbls = Array.from(document.getElementsByClassName("light-nums"));
    for(let light_num in light_num_lbls) {
        light_num_lbls[light_num].innerHTML = lights.pop();
    }

    
}

slide = (direction = 1, skip = 1) => {
    if(direction === 1) {
        translate -= translateAmount * skip;
    } else if (direction === -1) {
        translate += translateAmount * skip;
    }

    pages.forEach(
        pages => (pages.style.transform = `translateX(${translate}%)`)
    );
}

walls = ["graveyard", "lunch", "twilight", "stairs"];
light_phrases = ["It's too dark to see the name on the coffin", "The light in the fridge is out", "I can barely see what's howling", "I need more light to see what's on the stairs"];
dark_phrases = ["I can only visit the dead at night", "Someone's trying to peak at my lunch", "Protect the vampire from the sun", "Darness can hide magic pumpkins"];


function random_item(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function puzzle_complete(data) {
    websocket.send(`completed${current_puzzle}${data}`);
    current_puzzle++;
}