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
    skyline = new Skyline(numBuildings);
    skyline.defineBuildings() // initializes list of building heights
    skyline.defineEndCoord(); //chooses where the start and end coords are

    draw = new DrawSkyline(skyline, skylineCtx, cellSize, exitSprite);
    draw.clear(); //clear canvas
    draw.drawBuildings(); //loop through map and draw buildings
    draw.drawOcean();
    draw.drawEndMethod(); //draw end flag or sprite

    player = new SkylinePlayer(skyline, skylineCanvas, cellSize, setSkylineComplete, wingSprite);
    player.drawPlayerSprite(skyline.startCoord());

    // don't know what this is for
    if (document.getElementById("skylineContainer").style.opacity < "100") {
        document.getElementById("skylineContainer").style.opacity = "100";
    }
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
                y: lastHeight
            };
        }
    }
}

class DrawSkyline {
    constructor(Skyline, ctx, cellsize, endSprite = null) {
        const map = Skyline.map();
        let cellSize = cellsize;
        ctx.lineWidth = cellSize / 30;
        let width = map.length;


        //redraw maze with new size
        this.redrawSkyline = function (size) {
            cellSize = size;
            ctx.lineWidth = cellSize / 30;
            this.drawEndMethod();
        };

        //loop through map and draw building
        this.drawBuildings = function () {
            console.log("map", map);
            ctx.fillStyle = skyline_wall_color;
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = .5;
            for (let x = 0; x < width; x++) {
                let x_c = cellSize * x;
                ctx.rect(x_c, 0, cellSize, map[x] * cellSize);
            }
            ctx.fill();
            ctx.stroke();
        }

        this.drawOcean = function () {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, (width - 1) * cellSize, width * cellSize, cellSize);
        }

        //checkered flag in case there's a problem with end sprite 
        function drawEndFlag() {
            var coord = Skyline.endCoord();
            var gridSize = 4;
            var fraction = cellSize / gridSize - 2;
            var colorSwap = true;
            for (let y = 0; y < gridSize; y++) {
                if (gridSize % 2 == 0) {
                    colorSwap = !colorSwap;
                }
                for (let x = 0; x < gridSize; x++) {
                    ctx.beginPath();
                    ctx.rect(
                        coord.x * cellSize + x * fraction + 4.5,
                        coord.y * cellSize + y * fraction + 4.5,
                        fraction,
                        fraction
                    );
                    if (colorSwap) {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                    } else {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                    }
                    ctx.fill();
                    colorSwap = !colorSwap;
                }
            }
        }

        function drawEndSprite() {
            var offsetLeft = cellSize / 50;
            var offsetRight = cellSize / 25;
            var coord = Skyline.endCoord();
            ctx.drawImage(
                endSprite,
                2,
                2,
                endSprite.width,
                endSprite.height,
                coord.x * cellSize + offsetLeft,
                coord.y * cellSize + offsetLeft,
                cellSize - offsetRight,
                cellSize - offsetRight
            );
        }

        this.clear = function () {
            var canvasSize = cellSize * map.length;
            ctx.clearRect(0, 0, canvasSize, canvasSize);
        }

        this.drawEndMethod = function () {
            if (endSprite != null) {
                drawEndSprite();
            } else {
                drawEndFlag();
            }
        }
    }
}

class SkylinePlayer {
    constructor(skyline, c, _cellsize, onComplete, sprite = null) {
        let ctx = c.getContext("2d");
        
        let player = this;
        let map = skyline.map();
        let cellCoords = {
            x: skyline.startCoord().x,
            y: skyline.startCoord().y
        };
        let cellSize = _cellsize;
        let halfCellSize = cellSize / 2;
        let nextBuildingNum = 1;
        let weight = 0;
        let yPos = 0;
        let width = map.length;
        
        function redrawPlayer(_cellsize) {
            cellSize = _cellsize;
            this.drawPlayerSprite(cellCoords);
            weight = 0;
            yPos = 0;
            nextBuildingNum = 1;
        };

        //circle chape in case sprite doesn't show
        function drawSpriteCircle(coord) {
            ctx.beginPath();
            ctx.fillStyle = "yellow";
            ctx.arc(
                (coord.x + 1) * cellSize - halfCellSize,
                (coord.y + 1) * cellSize - halfCellSize,
                halfCellSize - 2,
                0,
                2 * Math.PI
            );
            ctx.fill();

            //when it reaches the end
            if (coord.x === skyline.endCoord().x && coord.y === skyline.endCoord().y) {
                onComplete();
                // player.unbindKeyDown();
            }
        }

        function drawSpriteImg(coord) {
            var offsetLeft = cellSize / 50;
            var offsetRight = cellSize / 25;
            ctx.drawImage(
                sprite,
                0,
                0,
                sprite.width,
                sprite.height,
                coord.x * cellSize + offsetLeft,
                coord.y * cellSize + offsetLeft,
                cellSize - offsetRight,
                cellSize - offsetRight
            );

            //when it reaches the end
            if (coord.x === skyline.endCoord().x && coord.y === skyline.endCoord().y) {
                onComplete();
            }
        }

        this.drawPlayerSprite = function (coord) {
            if (sprite != null) {
                drawSpriteImg(coord);
            } else {
                drawSpriteCircle(coord);
            }
        }

        function drawWeight() {
            const textCoords = {
                x: halfCellSize/2,
                y: (map.length - 2) * cellSize
            }
            ctx.clearRect(
                0,
                textCoords.y,
                cellSize,
                cellSize
            );
            ctx.font = "20px sans-serif";
            ctx.textBaseline = "top";
            ctx.fillStyle = "orange";
            ctx.fillText(`+${weight}  lb`, textCoords.x, textCoords.y);
        }

        //clear cell
        function removeSprite(coord) {
            var offsetLeft = cellSize / 50;
            var offsetRight = cellSize / 25;
            ctx.clearRect(
                coord.x * cellSize + offsetLeft,
                coord.y * cellSize + offsetLeft,
                cellSize - offsetRight,
                cellSize - offsetRight
            );
        }

        //redraw sprite in new location based on arrow keys
        function update(e) {
            checkOceanCollision();
            drawWeight();
            // move vertically if weight changes
            if(cellCoords.x < nextBuildingNum && yPos < width) {
                removeSprite(cellCoords);
                cellCoords = {
                    x: cellCoords.x,
                    y: yPos
                };
                player.drawPlayerSprite(cellCoords);
            }
            
            // move forward if free to
            if (yPos >= map[nextBuildingNum]) {
                removeSprite(cellCoords);
                cellCoords = {
                    x: cellCoords.x + 1,
                    y: yPos
                };
                player.drawPlayerSprite(cellCoords);
                nextBuildingNum++;
            }
        }

        function checkOceanCollision() {
            const oceanYPos = width - 1;
            if (yPos >= oceanYPos) {
                redrawPlayer();
            }
        }

        skyline_interval_id = setInterval(update, 200);

        document.addEventListener('keydown', function(event) {
            if ((event.key === 'w' || event.key === 'W') && weight < map.length - 1) {
                if (yPos >= map[nextBuildingNum - 1]) {
                    yPos++;
                }
                weight++;
            } else if ((event.key === 'p' || event.key === 'P') && weight > 0) {
                if (yPos > map[nextBuildingNum - 1]) {
                    yPos--;
                }
                weight--;
            }
        });
    }
}