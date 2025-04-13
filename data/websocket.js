var webcam_closed = false;

function doConnect() { // makes a connection and defines callbacks
    updateStatusLabel("Connecting to ws://" + localhost + ":81/ ...");
    
    websocket = new WebSocket("ws://" + localhost + ":81/");
    
    websocket.onopen = function(evt) {
        onOpen(evt)
    };
    websocket.onclose = function(evt) {
        onClose(evt)
    };
    websocket.onmessage = function(evt) {
        onMessage(evt)
    };
    websocket.onerror = function(evt) {
        onError(evt)
    };
}

function onOpen(evt) { // when handshake is complete:
	updateStatusLabel("Connected.");
    isConnectedToBox = true;

    skipPuzzle(); // skip passkey, curr_puzz = 0
    skipPuzzle(); // skip maze, curr_puzz = 1
    skipPuzzle(); // skip neos, curr_puzz = 2
    
    // skipPuzzle(); // weight
    // skipPuzzle(); // tilt
    // skipPuzzle(); // light/dark
    // skipPuzzle(); // neos
}

function onClose(evt) { // when socket is closed:
    isConnectedToBox = false;
	updateStatusLabel("Disconnected. Error: " + evt);
    webcam_closed = true;
}

function onMessage(msg) { // when socket receives a message
    var obj = JSON.parse(msg.data);
    box_curr_puzz = Number(obj.completed)
    // if (box_curr_puzz == 4 || box_curr_puzz == 7) {
    //     skipPuzzle();
    // } 
    updatePage(Number(obj.completed), obj.data);
}

function onError(evt) { // when an error occurs
	websocket.close();
	updateStatusLabel("Websocket error");
    skipPuzzle(); // skip passkey, curr_puzz = 0
    skipPuzzle(); // skip maze, curr_puzz = 1
    skipPuzzle(); // skip freqs
    // skipPuzzle(); // skip intensities
}

// Function to display to the message box
function updateStatusLabel(message)
{
  document.getElementById("status_lbl").innerHTML = message;
}

function puzzle_complete(data = "") {
    sendMessage('completed', current_puzzle, data);
    current_puzzle++;
    console.log("finished", current_puzzle-1, "Now on puzzle ", current_puzzle);
}

function sendMessage(type, num, data='') {
    if (isConnectedToBox) {
        let message = `${type}${num}${data}`;
        websocket.send(message);
    }
}