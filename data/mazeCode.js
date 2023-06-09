function shuffle(a) {
    //fisher-yates algorithm
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]; //destructuring assignment
    }
    return a;
}

function rand(max) {
    return Math.floor(Math.random() * max);
}

function makeMaze() {
    if (player != undefined) {
        // player.unbindKeyDown();
        player = null;
    }

    difficulty = 4;
    cellSize = mazeCanvas.width / difficulty; //difficulty x difficulty grid
    maze = new Maze(difficulty);
    maze.genMap(); //initialzes empty map
    maze.defineStartEnd(); //chooses where the start and end coords are
    maze.defineMaze(); //defines the valid directions from each cell

    draw = new DrawMaze(maze, ctx, cellSize, goalSprite);
    draw.clear(); //clear canvas
    draw.drawMap(); //loop through cells and draw lines
    draw.drawEndMethod(); //draw end flag or sprite

    player = new Player(maze, mazeCanvas, cellSize, setMazeComplete, ballSprite);
    player.drawBallSprite(maze.startCoord());
    // player.bindKeyDown();

    if (document.getElementById("mazeContainer").style.opacity < "100") {
        document.getElementById("mazeContainer").style.opacity = "100";
    }
}

class Maze {
    constructor(length) {
        var mazeMap;
        var width = length;
        var height = length;
        var startCoord, endCoord;
        var dirs = ["n", "s", "e", "w"];
        var modDir = {
            n: {
                y: -1,
                x: 0,
                o: "s"
            },
            s: {
                y: 1,
                x: 0,
                o: "n"
            },
            e: {
                y: 0,
                x: 1,
                o: "w"
            },
            w: {
                y: 0,
                x: -1,
                o: "e"
            }
        };

        this.map = function () {
            return mazeMap;
        };
        this.startCoord = function () {
            return startCoord;
        };
        this.endCoord = function () {
            return endCoord;
        };

        this.genMap = function () {
            mazeMap = new Array(height);
            for (let y = 0; y < height; y++) {
                mazeMap[y] = new Array(width);
                for (let x = 0; x < width; ++x) {
                    mazeMap[y][x] = {
                        n: false,
                        s: false,
                        e: false,
                        w: false,
                        visited: false,
                        priorPos: null
                    };
                }
            }
        }

        this.defineMaze = function () {
            var isComp = false;
            var move = false;
            var cellsVisited = 1;
            var numLoops = 0;
            var maxLoops = 0;
            var pos = {
                x: 0,
                y: 0
            };

            var numCells = width * height;

            while (!isComp) {
                move = false;
                mazeMap[pos.x][pos.y].visited = true;

                if (numLoops >= maxLoops) {
                    shuffle(dirs);
                    maxLoops = Math.round(rand(height / 8));
                    numLoops = 0;
                }

                numLoops++;

                for (let index = 0; index < dirs.length; index++) {
                    var direction = dirs[index];
                    var nx = pos.x + modDir[direction].x;
                    var ny = pos.y + modDir[direction].y;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        //Check if the tile is already visited
                        if (!mazeMap[nx][ny].visited) {
                            //Carve through walls from this tile to next
                            mazeMap[pos.x][pos.y][direction] = true;
                            mazeMap[nx][ny][modDir[direction].o] = true;

                            //Set Currentcell as next cells Prior visited
                            mazeMap[nx][ny].priorPos = pos;
                            //Update Cell position to newly visited location
                            pos = {
                                x: nx,
                                y: ny
                            };
                            cellsVisited++;
                            //Recursively call this method on the next tile
                            move = true;
                            break;
                        }
                    }
                }

                if (!move) {
                    //  If it failed to find a direction,
                    //  move the current position back to the prior cell and Recall the method.
                    pos = mazeMap[pos.x][pos.y].priorPos;
                }
                if (numCells == cellsVisited) {
                    isComp = true;
                }
            }
        }

        this.defineStartEnd = function () {
            switch (rand(4)) {
                case 0:
                    startCoord = {
                        x: 0,
                        y: 0
                    };
                    endCoord = {
                        x: height - 1,
                        y: width - 1
                    };
                    break;
                case 1:
                    startCoord = {
                        x: 0,
                        y: width - 1
                    };
                    endCoord = {
                        x: height - 1,
                        y: 0
                    };
                    break;
                case 2:
                    startCoord = {
                        x: height - 1,
                        y: 0
                    };
                    endCoord = {
                        x: 0,
                        y: width - 1
                    };
                    break;
                case 3:
                    startCoord = {
                        x: height - 1,
                        y: width - 1
                    };
                    endCoord = {
                        x: 0,
                        y: 0
                    };
                    break;
            }
        }
    }
}

class DrawMaze {
    constructor(Maze, ctx, cellsize, endSprite = null) {
        var map = Maze.map();
        var cellSize = cellsize;
        ctx.lineWidth = cellSize / 30;

        //redraw maze with new size
        this.redrawMaze = function (size) {
            cellSize = size;
            ctx.lineWidth = cellSize / 30;
            this.drawMap();
            this.drawEndMethod();
        };

        //draw a line on the side of the cell that isn't open
        function drawCell(xCord, yCord, cell) {
            var x = xCord * cellSize;
            var y = yCord * cellSize;
            ctx.strokeStyle = maze_wall_color;

            if (cell.n == false) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + cellSize, y);
                ctx.stroke();
            }
            if (cell.s === false) {
                ctx.beginPath();
                ctx.moveTo(x, y + cellSize);
                ctx.lineTo(x + cellSize, y + cellSize);
                ctx.stroke();
            }
            if (cell.e === false) {
                ctx.beginPath();
                ctx.moveTo(x + cellSize, y);
                ctx.lineTo(x + cellSize, y + cellSize);
                ctx.stroke();
            }
            if (cell.w === false) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + cellSize);
                ctx.stroke();
            }
        }

        //loop through cells and draw lines
        this.drawMap = function () {
            for (let x = 0; x < map.length; x++) {
                for (let y = 0; y < map[x].length; y++) {
                    drawCell(x, y, map[x][y]);
                }
            }
        }

        //checkered flag in case there's a problem with end sprite 
        function drawEndFlag() {
            var coord = Maze.endCoord();
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
            var coord = Maze.endCoord();
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

class Player {
    constructor(maze, c, _cellsize, onComplete, sprite = null) {
        var ctx = c.getContext("2d");
        
        var player = this;
        var map = maze.map();
        var cellCoords = {
            x: maze.startCoord().x,
            y: maze.startCoord().y
        };
        var cellSize = _cellsize;
        var halfCellSize = cellSize / 2;
        
        this.redrawPlayer = function (_cellsize) {
            cellSize = _cellsize;
            this.drawBallSprite(cellCoords);
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
            if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
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
            if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
                onComplete();
            }
        }

        this.drawBallSprite = function (coord) {
            if (sprite != null) {
                drawSpriteImg(coord);
            } else {
                drawSpriteCircle(coord);
            }
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
        function check(e) {
            var cell = map[cellCoords.x][cellCoords.y];

            if (d_tilt == "west") {
                if (cell.w == true) {
                    removeSprite(cellCoords);
                    cellCoords = {
                        x: cellCoords.x - 1,
                        y: cellCoords.y
                    };
                    player.drawBallSprite(cellCoords);
                }
            } else if (d_tilt == "east") {
                if (cell.e == true) {
                    removeSprite(cellCoords);
                    cellCoords = {
                        x: cellCoords.x + 1,
                        y: cellCoords.y
                    };
                    player.drawBallSprite(cellCoords);
                }
            } else if (d_tilt == "north") {
                if (cell.n == true) {
                    removeSprite(cellCoords);
                    cellCoords = {
                        x: cellCoords.x,
                        y: cellCoords.y - 1
                    };
                    player.drawBallSprite(cellCoords);
                }
            } else if (d_tilt == "south") {
                if (cell.s == true) {
                    removeSprite(cellCoords);
                    cellCoords = {
                        x: cellCoords.x,
                        y: cellCoords.y + 1
                    };
                    player.drawBallSprite(cellCoords);
                }
            }
        }

        maze_interval_id = setInterval(check, 200);
    }
}
