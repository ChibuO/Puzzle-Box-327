let skyline_completed = false;
let skyline_interval_id;
let skyline_ball_direction = 1;
let skyline_ball_weight = 0;
const skyline_num_buildings = 10; // square canvas
const skyline_wall_color = "white";

const setupSkyline = () => {
    const skylineCanvas = document.getElementById("skylineCanvas");
    const skylineCtx = skylineCanvas.getContext("2d");
    let wingSprite;
    let exitSprite;
    let viewbox = document.querySelector("#skyline_box");
    let viewWidth = viewbox.offsetWidth;
    let viewHeight = viewbox.offsetHeight;
    if (viewHeight < viewWidth) {
        skylineCtx.canvas.width = viewHeight - viewHeight / 5;
        skylineCtx.canvas.height = viewHeight - viewHeight / 5;
    } else {
        skylineCtx.canvas.width = viewWidth - viewWidth / 5;
        skylineCtx.canvas.height = viewWidth - viewWidth / 5;
    }

    //Load and edit sprites
    var completeOne = false;
    var completeTwo = false;

    var isComplete = () => {
        if (completeOne === true && completeTwo === true) {
            setTimeout(function () {
                makeSkyline(wingSprite, exitSprite, skylineCtx);
            }, 500);
        }
    };

    wingSprite = new Image();
    wingSprite.src = "./key.png";
    wingSprite.onload = function () {
        completeOne = true;
        isComplete();
    };

    exitSprite = new Image();
    exitSprite.src = "./home.png";
    exitSprite.onload = function () {
        completeTwo = true;
        isComplete();
    };
}

function makeSkyline(wingSprite, exitSprite, skylineCtx) {
    let skyline, draw, player;
    let cellSize;

    if (player != undefined) {
        player = null;
    }

    cellSize = skylineCanvas.width / skyline_num_buildings; //numBuildings x numBuildings grid

    skyline = new Skyline(skyline_num_buildings, skylineCtx, cellSize, exitSprite);
    skyline.clear(); //clear canvas
    skyline.drawBuildings(); //loop through map and draw buildings
    skyline.drawCoins();
    skyline.drawOcean();

    player = new SkylinePlayer(skyline, skylineCanvas, cellSize, setSkylineComplete, wingSprite);
    player.drawPlayerSprite(skyline.startCoord);

    // don't know what this is for
    if (document.getElementById("skylineContainer").style.opacity < "100") {
        document.getElementById("skylineContainer").style.opacity = "100";
    }

    skyline_interval_id = setInterval(() => startSkylineGame(skyline, player), 200);
}

function updateWeight(boxData) {
    const newWeight = parseFloat(boxData);
    console.log(newWeight);
    // weight: 0 < newWeight < numBuildings - 1
    // if (newWeight < skyline_num_buildings - 1 && newWeight > 0) {
    //     skyline_ball_weight = newWeight;
    // } else if (newWeight >= skyline_num_buildings) {
    //     skyline_ball_weight = skyline_num_buildings - 1;
    // } else if (newWeight <= 0) {
    //     skyline_ball_weight = 0;
    // }
}

function setSkylineComplete() {
    console.log("skyline complete");
    clearInterval(skyline_interval_id);
    setTimeout(() => {
        slide();
    }, 2000);
    puzzle_complete();
}

class Skyline {
    constructor(length, ctx, cellSize, endSprite = null) {
        this.length = length;
        this.width = length;
        this.height = length;
        this.endSprite = endSprite
        this.cellSize = cellSize;
        this.ctx = ctx;
        this.ctx.lineWidth = this.cellSize / 30;
        this.skylineMap = this.defineBuildings();
        this.startCoord = {
            x: 0,
            y: 0
        };
        this.endCoord = this.defineEndCoord();
        this.coinArray = this.defineCoins();
    }

    get map() {
        return this.skylineMap;
    };
    set map(map) {
        this.skylineMap = map;
    };

    // initializes list of building heights
    defineBuildings() {
        let map = new Array(this.width);
        map[0] = 0; // no building on first
        for (let x = 1; x < this.width; x++) {
            map[x] = rand(this.height - 2, 1);
        }
        return map;
    }

    defineCoins() {
        let map = new Array(this.width);
        map[0] = 0;
        for (let x = 1; x < this.width; x++) {
            map[x] = 1;
        }
        return map;
    }

    // choose where start and end cords are
    defineEndCoord() {
        const lastHeight = this.skylineMap[this.width];
        return {
            x: this.width - 1,
            y: lastHeight - 1
        };
    }

    //redraw maze with new size
    resetSkyline() {
        this.ctx.lineWidth = this.cellSize / 30;
        this.defineCoins();
        this.drawCoins();
        // this.drawEndMethod();
    };

    //loop through map and draw building
    drawBuildings() {
        // console.log("map", this.skylineMap);
        this.ctx.fillStyle = skyline_wall_color;
        this.ctx.strokeStyle = 'gray';
        this.ctx.lineWidth = .5;
        for (let x = 0; x < this.width; x++) {
            let x_c = this.cellSize * x;
            this.ctx.rect(x_c, 0, this.cellSize, this.skylineMap[x] * this.cellSize);
        }
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawCoins() {
        this.coinArray.forEach((x, index) => {
            if (x) {
                let coinCoords = {
                    x: index,
                    y: this.skylineMap[index]
                };
                this.drawCoin(coinCoords);
            }
        });
    }

    drawCoin(coinCoords) {
        const halfCellSize = this.cellSize / 2;
        this.ctx.beginPath();
        this.ctx.fillStyle = "pink";
        this.ctx.arc(
            (coinCoords.x + 1) * this.cellSize - halfCellSize,
            (coinCoords.y + 1) * this.cellSize - halfCellSize,
            halfCellSize - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }

    drawOcean() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, (this.width - 1) * this.cellSize, this.width * this.cellSize, this.cellSize);
    }

    clear() {
        var canvasSize = this.cellSize * this.length;
        this.ctx.clearRect(0, 0, canvasSize, canvasSize);
    }
}

class SkylinePlayer {
    constructor(skyline, c, _cellsize, onComplete, sprite = null) {
        this.skyline = skyline;
        this.ctx = c.getContext("2d");
        this.cellSize = _cellsize;
        this.onComplete = onComplete;
        this.sprite = sprite;

        this.map = this.skyline.map;
        this.cellCoords = {
            x: this.skyline.startCoord.x,
            y: this.skyline.startCoord.y
        };
        this.halfCellSize = this.cellSize / 2;
        this.nextBuildingNum = 1;
        this.weight = 0;
        this.yPos = 0;
        this.width = this.map.length;
        this.score = 0;

        document.addEventListener('keydown', (event) => {
            let currentBuildingNum;
            if(skyline_ball_direction > 0) {
                currentBuildingNum = this.nextBuildingNum - 1;
            } else {
                currentBuildingNum = this.nextBuildingNum + 1;
            }
            if ((event.key === 'w' || event.key === 'W') && this.weight < this.width - 1) {
                if (this.yPos >= this.map[currentBuildingNum]) {
                    this.yPos++;
                }
                this.weight++;
            } else if ((event.key === 'p' || event.key === 'P') && this.weight > 0) {
                if (this.yPos > this.map[currentBuildingNum]) {
                    this.yPos--;
                }
                this.weight--;
            }
        });

        document.getElementById("reverse-btn").addEventListener('click', (event) => {
            skyline_ball_direction = skyline_ball_direction * -1;
            if (skyline_ball_direction < 0) {
                this.nextBuildingNum = this.nextBuildingNum - 2;
            } else {
                this.nextBuildingNum = this.nextBuildingNum + 2;
            }
            console.log("reverse", this.nextBuildingNum);
        });
    }

    get playerCoords() {
        return this.cellCoords;
    };
    set playerCoords(playerCoords) {
        this.cellCoords = playerCoords;
    };

    //circle chape in case sprite doesn't show
    drawSpriteCircle(coord) {
        this.ctx.beginPath();
        this.ctx.fillStyle = "yellow";
        this.ctx.arc(
            (coord.x + 1) * cellSize - halfCellSize,
            (coord.y + 1) * cellSize - halfCellSize,
            halfCellSize - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();

        //when it reaches the end
        if (coord.x === this.skyline.endCoord.x && coord.y === this.skyline.endCoord.y) {
            onComplete();
        }
    }

    drawSpriteImg(coord) {
        let offsetLeft = this.cellSize / 50;
        let offsetRight = this.cellSize / 25;
        this.ctx.drawImage(
            this.sprite,
            0,
            0,
            this.sprite.width,
            this.sprite.height,
            coord.x * this.cellSize + offsetLeft,
            coord.y * this.cellSize + offsetLeft,
            this.cellSize - offsetRight,
            this.cellSize - offsetRight
        );

        //when it reaches the end
        if (coord.x === this.skyline.endCoord.x && coord.y === this.skyline.endCoord.y) {
            onComplete();
        }
    }

    drawPlayerSprite(coord) {
        if (this.sprite != null) {
            this.drawSpriteImg(coord);
        } else {
            this.drawSpriteCircle(coord);
        }
    }

    resetPlayer() {
        this.removeSprite(this.cellCoords);
        this.cellCoords = {
            x: this.skyline.startCoord.x,
            y: this.skyline.startCoord.y
        };
        this.drawPlayerSprite(this.cellCoords);
        this.weight = 0;
        this.score = 0;
        this.yPos = 0;
        skyline_ball_direction = 1;
        this.nextBuildingNum = 1;
        this.skyline.resetSkyline();
    };

    drawWeight() {
        const textCoords = {
            x: this.halfCellSize / 2,
            y: (this.map.length - 2) * this.cellSize
        }
        this.ctx.clearRect(
            0,
            textCoords.y,
            this.cellSize,
            this.cellSize
        );
        this.ctx.font = "20px sans-serif";
        this.ctx.textBaseline = "top";
        this.ctx.fillStyle = "orange";
        this.ctx.fillText(`+${this.weight}  lb`, textCoords.x, textCoords.y);
    }

    //clear cell
    removeSprite(coord) {
        // console.log("removing", coord);
        let offsetLeft = this.cellSize / 50;
        let offsetRight = this.cellSize / 25;
        this.ctx.clearRect(
            coord.x * this.cellSize + offsetLeft,
            coord.y * this.cellSize + offsetLeft,
            this.cellSize - offsetRight,
            this.cellSize - offsetRight
        );
    }

    checkOceanCollision() {
        const oceanYPos = this.width - 1;
        return this.yPos >= oceanYPos;
    }

    checkCoinCollision(coinArray, currentBuildingNum) {
        const x_check = this.cellCoords.x > 0 && this.cellCoords.x == currentBuildingNum;
        return coinArray[currentBuildingNum] && x_check && this.cellCoords.y == this.map[currentBuildingNum];
    }

    moveSprite(x_pos, y_pos) {
        this.removeSprite(this.playerCoords);
        this.playerCoords = {
            x: x_pos,
            y: y_pos
        };
        this.drawPlayerSprite(this.playerCoords);
    }
}

const startSkylineGame = (skyline, skylinePlayer) => {
    const width = skylinePlayer.width;
    let yPos = skylinePlayer.yPos;
    const map = skyline.map;
    const weight = skylinePlayer.weight;
    let currentBuildingNum;

    if (skyline_ball_direction == 1) {
        currentBuildingNum = skylinePlayer.nextBuildingNum - 1;
    } else {
        currentBuildingNum = skylinePlayer.nextBuildingNum + 1;
    }

    if(skylinePlayer.checkOceanCollision()) {
        skylinePlayer.resetPlayer();
        return;
    }
    skylinePlayer.drawWeight();
    let x_pos = skylinePlayer.playerCoords.x;

    if(skylinePlayer.checkCoinCollision(skyline.coinArray, currentBuildingNum)) {
        skylinePlayer.score++;
        skyline.coinArray[currentBuildingNum] = 0;
        // console.log(skylinePlayer.score);
    }

    if(skylinePlayer.score >= width - 1) {
        setSkylineComplete();
    }

    // move sprite up if weight it lighter than y position
    if (skylinePlayer.yPos > map[currentBuildingNum] && skylinePlayer.yPos > weight) {
        skylinePlayer.moveSprite(x_pos, skylinePlayer.yPos--);
        yPos = skylinePlayer.yPos;
    }
    
    if (skyline_ball_direction == 1) {
        // move vertically if weight changes
        if (x_pos < skylinePlayer.nextBuildingNum && yPos < width) {
            skylinePlayer.moveSprite(x_pos, yPos);
        }
        
        // move forward if free to
        // console.log(currentBuildingNum, width);
        if (yPos >= map[skylinePlayer.nextBuildingNum] && currentBuildingNum < width) {
            skylinePlayer.moveSprite(x_pos + skyline_ball_direction, yPos);
            skylinePlayer.nextBuildingNum++;
        }
    } else {
        // reverse
        if (x_pos > skylinePlayer.nextBuildingNum && yPos < width && x_pos >= 0) {
            skylinePlayer.moveSprite(x_pos, yPos);
        }

        // console.log(x_pos, yPos, skylinePlayer.nextBuildingNum);
        // console.log(yPos, map[skylinePlayer.nextBuildingNum], x_pos, skylinePlayer.nextBuildingNum);
        // console.log(yPos >= map[skylinePlayer.nextBuildingNum], x_pos > 0, skylinePlayer.nextBuildingNum + 1 > 0);
        if (yPos >= map[skylinePlayer.nextBuildingNum] && x_pos > 0 && currentBuildingNum >= 0) {
            skylinePlayer.moveSprite(x_pos + skyline_ball_direction, yPos);
            skylinePlayer.nextBuildingNum--;
        }
    }
    // console.log(skylinePlayer.playerCoords, currentBuildingNum, skylinePlayer.nextBuildingNum);
}