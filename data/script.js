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

let walls = ["graveyard", "lunch", "twilight", "stairs"];
let light_phrases = ["It's too dark to see the name on the coffin", "The light in the fridge is out", "I can barely see what's howling", "I need more light to see what's on the stairs"];
let dark_phrases = ["I can only visit the dead at night", "Someone's trying to peak at my lunch", "Protect the vampire from the sun", "Darness can hide magic pumpkins"];


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
    element_ids.slice(0, num).map((i) => {
        document.getElementById(i).classList.add("strike");
    });

    console.log(`list puzzle ${num}`);

    //num comes from the box itself
    switch(num) {
        case 1:
            //maze - web tells box that it's completed
            //box gives acceleration data
            updateDirection(data);
            break;
        case 2:
            //lights - box tells web that it's completed
            if (data === "completed") {
                slide();
                puzzle_complete();
            }
            break;
        case 3:
            //weights1 - box tells web that it's completed
            if (data === "completed") {
                slide();
                puzzle_complete();
            }
            break;
        case 4:
            //tilt - web tells box that it's completed
            if (data === "completed") {
                slide();
            } else {
                updateRotation(data);
            }
            break;
        case 5:
            //photoresistors  - box tells web that it's completed
            //box gives web photoresistor status
            //reveal first half
            if (data === "halfway") {
                document.getElementById("lightside").style.background = "white";
                document.getElementById("lightside-clue").style.color = "black";
                document.getElementById("darkside-clue").style.color = "black";
            } else if (data === "continue") { //reveal second half
                document.getElementById("lightside-clue").style.color = "white";
                document.getElementById("darkside").style.background = "black";
            } else if (data === "completed") {
                 //box then tells web when all potentiometers turned down
                slide();
            } else {
                //the clue numbers
                console.log(data);
                set_ldr_clue(Number(data[0]), Number(data[1]));
            }
            break;
        case 6:
            //neopiixels - box tells web when completed
            document.getElementById("admin-btn").style.color = "black";
            if (data === "completed") {
                slide();
            }
            break;
        case 7:
            //weights2 - box tells web when completed
            document.getElementById("admin-btn").style.color = "white";
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

function skipPuzzle() {
    document.getElementById("skipBtn").disabled = true;
    websocket.send(`skip${current_puzzle}`);

    switch(current_puzzle) {
        case 0:
            //password
            passkey_completed();
            break;
        case 1:
            //maze
            setMazeComplete();
            break;
        case 2:
            //lights
            // slide();
            // current_puzzle++;
            break;
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
            //finale - box tells web when completed
            // slide();
            // current_puzzle++;
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
    var obj = JSON.parse(msg.data);
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

function setMazeComplete() {
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
    }, 4000);
    clearInterval(maze_interval_id);
    let light_string = `${light_order.indexOf(1)}${light_order.indexOf(2)}${light_order.indexOf(3)}`;
    puzzle_complete(light_string, true);
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

passkey_completed = () => {
    set_light_order();
    slide();
    setTimeout(() => {
        // box_down_screen.style.opacity = 1;
        slide();
    }, 4000);
    puzzle_complete("", true);
}

passkey_txtbox.addEventListener("input", (event) => {
    if(event.target.value === passkey) {
        // welcome_screen.style.opacity = 0;
        event.target.value = "";
        passkey_completed();
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
    let skip_side = Math.floor(Math.random() * 3); //side to skip, want to keep 4
    //get numbers for sides of box
    for(i=0; i < 4; i++) {
        if (i != skip_side) {
            // Returns a random integer from 1 to 4 (inclusive):
            let r_int = Math.floor(Math.random() * 3) + 1;
            while (light_order.includes(r_int)) {
                r_int = Math.floor(Math.random() * 3) + 1;
            }
            light_order.push(r_int);
            lights.push(r_int);
        } else {
            light_order.push(0);
            lights.push(0);
        }
    }
    
    console.log(lights.toString());
    
    let light_num_lbls = Array.from(document.getElementsByClassName("light-nums"));
    
    for(let light_num in light_num_lbls) {
        let light_val = lights.pop();
        if (light_val != 0) {
            light_num_lbls[light_num].innerHTML = light_val;
        } else {
            light_num_lbls[light_num].innerHTML = "";
        }
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

    document.getElementById("skipBtn").disabled = false;
}

function random_item(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function puzzle_complete(data = "", should_send = false) {
    if (should_send) {
        websocket.send(`completed${current_puzzle}${data}`);
    }
    current_puzzle++;
}

function set_ldr_clue(light_ldr, dark_ldr) {
    console.log(walls[light_ldr], walls[dark_ldr]);
    document.getElementById("lightside-clue").innerHTML= light_phrases[light_ldr];
    document.getElementById("darkside-clue").innerHTML = dark_phrases[dark_ldr];
}
