let skyline_completed = false;
let skyline_interval_id;
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
    let numBuildings = 10;

    if (player != undefined) {
        player = null;
    }

    cellSize = skylineCanvas.width / numBuildings; //numBuildings x numBuildings grid
    // skyline = new CreateSkyline(numBuildings);
    // skyline.defineBuildings() // initializes list of building heights
    // skyline.defineEndCoord(); //chooses where the start and end coords are

    skyline = new Skyline(numBuildings, skylineCtx, cellSize, exitSprite);
    skyline.clear(); //clear canvas
    skyline.drawBuildings(); //loop through map and draw buildings
    skyline.drawOcean();
    skyline.drawEndMethod(); //draw end flag or sprite

    player = new SkylinePlayer(skyline, skylineCanvas, cellSize, setSkylineComplete, wingSprite);
    player.drawPlayerSprite(skyline.startCoord);

    // don't know what this is for
    if (document.getElementById("skylineContainer").style.opacity < "100") {
        document.getElementById("skylineContainer").style.opacity = "100";
    }

    // startGame(draw, player);
}

// function redrawSkylinePuzzle() {

// }

function setSkylineComplete() {
    setNeoPixelScreen();
    slide(-1);
    setTimeout(() => {
        slide(1, 2);
    }, 1000);
    clearInterval(skyline_interval_id);
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
    }

    get map() {
        return this.skylineMap;
    };
    // get startCoord() {
    //     return startCoord;
    // };
    // get endCoord() {
    //     return this.endCoord;
    // };

    // initializes list of building heights
    defineBuildings() {
        console.log("2", this.length);
        let map = new Array(this.width);
        map[0] = 0; // no building on first
        for (let y = 1; y < this.width; y++) {
            map[y] = rand(this.height - 2, 1);
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
    redrawSkyline(size) {
        this.cellSize = size;
        this.ctx.lineWidth = cellSize / 30;
        this.drawEndMethod();
    };

    //loop through map and draw building
    drawBuildings() {
        console.log("map", this.skylineMap);
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

    drawOcean() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, (this.width - 1) * this.cellSize, this.width * this.cellSize, this.cellSize);
    }

    //checkered flag in case there's a problem with end sprite 
    drawEndFlag() {
        var coord = this.endCoord;
        var gridSize = 4;
        var fraction = this.cellSize / gridSize - 2;
        var colorSwap = true;
        for (let y = 0; y < gridSize; y++) {
            if (gridSize % 2 == 0) {
                colorSwap = !colorSwap;
            }
            for (let x = 0; x < gridSize; x++) {
                this.ctx.beginPath();
                this.ctx.rect(
                    coord.x * cellSize + x * fraction + 4.5,
                    coord.y * cellSize + y * fraction + 4.5,
                    fraction,
                    fraction
                );
                if (colorSwap) {
                    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                } else {
                    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                }
                this.ctx.fill();
                colorSwap = !colorSwap;
            }
        }
    }

    drawEndSprite() {
        var offsetLeft = this.cellSize / 50;
        var offsetRight = this.cellSize / 25;
        var coord = this.endCoord;
        this.ctx.drawImage(
            this.endSprite,
            2,
            2,
            this.endSprite.width,
            this.endSprite.height,
            coord.x * this.cellSize + offsetLeft,
            coord.y * this.cellSize + offsetLeft,
            this.cellSize - offsetRight,
            this.cellSize - offsetRight
        );
    }

    clear() {
        var canvasSize = this.cellSize * this.length;
        this.ctx.clearRect(0, 0, canvasSize, canvasSize);
    }

    drawEndMethod() {
        if (this.endSprite != null) {
            this.drawEndSprite();
        } else {
            this.drawEndFlag();
        }
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

        document.addEventListener('keydown', (event) => {
            if ((event.key === 'w' || event.key === 'W') && this.weight < this.width - 1) {
                if (this.yPos >= this.map[this.nextBuildingNum - 1]) {
                    this.yPos++;
                }
                this.weight++;
            } else if ((event.key === 'p' || event.key === 'P') && this.weight > 0) {
                if (this.yPos > this.map[this.nextBuildingNum - 1]) {
                    this.yPos--;
                }
                this.weight--;
            }
        });

        skyline_interval_id = setInterval(() => this.update(), 200);
    }

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
            // player.unbindKeyDown();
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
        this.yPos = 0;
        this.nextBuildingNum = 1;
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

    //redraw sprite in new location based on arrow keys
    update() {
        if(this.checkOceanCollision()) {
            this.resetPlayer();
        }
        this.drawWeight();
        let x_pos = this.cellCoords.x;
        // move vertically if weight changes
        if (x_pos < this.nextBuildingNum && this.yPos < this.width) {
            this.removeSprite(this.cellCoords);
            this.cellCoords = {
                x: x_pos,
                y: this.yPos
            };
            this.drawPlayerSprite(this.cellCoords);
        }

        // move forward if free to
        if (this.yPos >= this.map[this.nextBuildingNum]) {
            this.removeSprite(this.cellCoords);
            this.cellCoords = {
                x: x_pos + 1,
                y: this.yPos
            };
            this.drawPlayerSprite(this.cellCoords);
            this.nextBuildingNum++;
        }
    }
}

const startGame = (skyline, skylinePlayer) => {
    skyline_interval_id = setInterval(() => update(), 200);
}


class CreateSkyline {
    constructor(length) {
        var skylineMap;
        var width = length;
        var height = length;
        var startCoord, endCoord;

        this.map = function () {
            return skylineMap;
        };
        this.startCoord = function () {
            return startCoord;
        };
        this.endCoord = function () {
            return endCoord;
        };

        this.defineBuildings = function () {
            skylineMap = new Array(width);
            skylineMap[0] = 0; // no building on first
            for (let y = 1; y < width; y++) {
                skylineMap[y] = rand(height - 2, 1);
            }
        }

        // choose where start and end cords are
        this.defineEndCoord = function () {
            startCoord = {
                x: 0,
                y: 0
            };

            const lastHeight = skylineMap[width];
            endCoord = {
                x: width - 1,
                y: lastHeight - 1
            };
        }
    }
}
