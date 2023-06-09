var canvas = document.getElementById("myCanvas");
var riddle = document.getElementById("riddleID");
var ctx = canvas.getContext("2d");
ctx.lineWidth = 10;
var angle = 0;
var centerX = canvas.width/2;
var centerY = canvas.height/10;
var height = 300;
var scaleLen = 400;
var targetWeight = null;
var currWeight = null;

var goldClue = "A precious metal, leading the way,\nRadiating brilliance without delay. \nThe pinnacle of wealth, rare and esteemed, \nA symbol of victory, dreams redeemed. \nWhat am I?";
var silverClue = "Among the elements, I gleam so bold, \nSometimes associated with the second, I'm told. \nReflecting value with a radiant hue, \nAdorned in elegance, a treasure so true. \nWhat am I?";
var copperClue = "In bronze I gleam, reddish and true, \nConducting electricity, prized through and through. \nThird in line, with humble grace, \nA versatile metal, in every case. \nWhat am I?";

var clueArray = [goldClue, silverClue, copperClue];
var weightArray = [79, 47, 29];

function init() {
    var index = Math.floor(Math.random()*100) % 3;
    riddle.innerText = clueArray[index];
    drawScale(centerX-scaleLen/2, centerY, centerX+scaleLen/2, centerY, height);
    targetWeight = weightArray[index];   
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawTriangle(topX, topY, length) {
    ctx.moveTo(topX, topY);
    ctx.lineTo(topX+(length/2), topY+length);
    ctx.lineTo(topX-(length/2), topY+length);
    ctx.lineTo(topX, topY);
    ctx.stroke();
}

function drawScale(leftX, leftY, rightX, rightY, height){
    /*
    base is half of height
    height is 3/4 of distance between scales
    scale triangles are 1/2.4 the height
    */
    var baseWidth = height/2;
    var triangleLen = height/2.4;
    clearCanvas();
    drawTriangle(leftX, leftY, triangleLen);
    drawTriangle(rightX, rightY, triangleLen);
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.stroke();
    var centerX = (leftX+rightX)/2;
    var centerY = (leftY+rightY)/2;
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY+height);
    ctx.moveTo(centerX-baseWidth/2, centerY+height);
    ctx.lineTo(centerX+baseWidth/2, centerY+height);
    ctx.stroke(); 
}


function raiseRightScale() {
    if (angle < 0.3) {
        var changeY = Math.sin(angle)*0.5*scaleLen;
        var changeX = Math.cos(angle)*0.5*scaleLen;
        var newLeftY = centerY + changeY;
        var newLeftX = centerX - changeX;
        var newRightY = centerY - changeY;
        var newRightX = centerX + changeX;
        clearCanvas();
        ctx.beginPath();
        drawScale(newLeftX, newLeftY, newRightX, newRightY, height);
        angle += 0.01;
        setTimeout(raiseRightScale, 25);
    }
}

function lowerRightScale() {
    if (angle > -0.3) {
        var changeY = Math.sin(angle)*0.5*scaleLen;
        var changeX = Math.cos(angle)*0.5*scaleLen;
        var newLeftY = centerY + changeY;
        var newLeftX = centerX - changeX;
        var newRightY = centerY - changeY;
        var newRightX = centerX + changeX;
        clearCanvas();
        ctx.beginPath();
        drawScale(newLeftX, newLeftY, newRightX, newRightY, height);
        angle -= 0.01;
        setTimeout(lowerRightScale, 25);
    }
}

function balanceScale() {
    var changeY = Math.sin(angle)*0.5*scaleLen;
    var changeX = Math.cos(angle)*0.5*scaleLen;
    var newLeftY = centerY + changeY;
    var newLeftX = centerX - changeX;
    var newRightY = centerY - changeY;
    var newRightX = centerX + changeX;
    clearCanvas();
    ctx.beginPath();
    drawScale(newLeftX, newLeftY, newRightX, newRightY, height);
    if (angle > 0.005) {
        angle -= 0.01;
    } else if (angle < -0.005) {
        angle += 0.01;
    }
    setTimeout(balanceScale, 25);
}

function winWeight() {
    // send win message to esp
    console.log("you win");
}

function compareWeight(currWeight) {
    if ((currWeight > targetWeight-2) && (currWeight < targetWeight +2)) {
        balanceScale();
        clearInterval(weightRefreshId);
        winWeight();
    } else if (currWeight > targetWeight) {
        raiseRightScale();
    } else {
        lowerRightScale();
    }
}

function readLoadCell() {
    
    
    return weight;
}



init();
var weightRefreshId = setInterval(
    function () { compareWeight(currWeight);}, 100);
