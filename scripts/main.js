let m;

let player;
let walls;
let open;
let exit;
// let testWall;
// let testOpen;
// let testGroup;

let scale = 120;

const numberOfMazes = 3;
const mazeStartWidth = 10;
const mazeStartHeight = 12;

let mazesStarted = 0;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(60);

    newMaze(mazeStartWidth + mazesStarted * 2, mazeStartHeight + mazesStarted * 2, 0.02, 6);
}

function newMaze(w, h, holes, powerups) {
    mazesStarted++;
    m = new MazeGenerator(w, h, holes, powerups);
    m.generate();

    if (open) open.removeSprites();
    if (walls) walls.removeSprites();
    if (player) player.remove();
    if (exit) exit.remove();

    player = createSprite(m.start[1] * scale + scale / 2, m.start[0] * scale + scale / 2, scale / 2, scale / 2);

    open = new Group();
    walls = new Group();

    let singleSquares = new Set();

    for (let i = 0; i < m.grid.length; i++) {
        let rectangleLength = scale;
        let startX = 0;
        let startY = scale * i;
        let colorRect = m.grid[i][0];
        for (let j = 0; j < m.grid[0].length; j++) {
            if (j < m.grid[0].length - 1) {
                if (m.grid[i][j + 1] == m.grid[i][j]) {
                    rectangleLength += scale;
                } else {
                    if (rectangleLength != scale) {
                        let box = createSprite(startX + rectangleLength / 2, startY + scale / 2, rectangleLength, scale);
                        if (colorRect == 1) {
                            box.shapeColor = color(0);
                            walls.add(box)
                        } else {
                            box.shapeColor = color(255);
                            open.add(box)
                        }
                    } else {
                        singleSquares.add(startX + "," + startY)
                    }

                    rectangleLength = scale;
                    startX = scale * (j + 1);
                    colorRect = m.grid[i][j + 1];
                }
            } else {
                if (rectangleLength != scale) {
                    let box = createSprite(startX + rectangleLength / 2, startY + scale / 2, rectangleLength, scale);
                    if (colorRect == 1) {
                        box.shapeColor = color(0);
                        walls.add(box)
                    } else {
                        box.shapeColor = color(255);
                        open.add(box)
                    }
                } else {
                    singleSquares.add(startX + "," + startY)
                }
            }
        }
    }

    for (let j = 0; j < m.grid[0].length; j++) {
        let rectangleLength = scale;

        let startX = scale * j;
        let startY = 0;
        let colorRect = m.grid[0][j];
        for (let i = 0; i < m.grid.length; i++) {
            if (i < m.grid.length - 1) {
                if (m.grid[i + 1][j] == m.grid[i][j]) {
                    rectangleLength += scale;
                } else {
                    if (rectangleLength != scale) {
                        let box = createSprite(startX + scale / 2, startY + rectangleLength / 2, scale, rectangleLength);
                        if (colorRect == 1) {
                            box.shapeColor = color(0);
                            walls.add(box)
                        } else {
                            box.shapeColor = color(255);
                            open.add(box)
                        }
                    } else {
                        if (singleSquares.has(startX + "," + startY)) {
                            let box = createSprite(startX + scale / 2, startY + scale / 2, scale, scale);
                            box.shapeColor = color(0);
                            walls.add(box)
                        }
                    }

                    rectangleLength = scale;
                    startY = scale * (i + 1);
                    colorRect = m.grid[i + 1][j];
                }
            } else {
                if (rectangleLength != scale) {
                    let box = createSprite(startX + scale / 2, startY + rectangleLength / 2, scale, rectangleLength);

                    if (colorRect == 1) {
                        box.shapeColor = color(0);
                        walls.add(box)
                    } else {
                        box.shapeColor = color(255);
                        open.add(box)
                    }
                } else {
                    if (singleSquares.has(startX + "," + startY)) {
                        let box = createSprite(startX + scale / 2, startY + scale / 2, scale, scale);
                        box.shapeColor = color(0);
                        walls.add(box)
                    }
                }
            }
        }

    }


    fill(0)
    const topBox = createSprite(m.H * scale / 2 - 1000, -1000, m.H * scale + 2000, 2000);
    topBox.shapeColor = color(0);
    walls.add(topBox);

    const bottomBox = createSprite(m.H * scale / 2 - 1000, m.W * scale + 1000, m.H * scale + 2000, 2000);
    bottomBox.shapeColor = color(0);
    walls.add(bottomBox);

    const leftBox = createSprite(-1000, m.W * scale / 2, 2000, m.W * scale);
    leftBox.shapeColor = color(0);
    walls.add(leftBox);

    const rightBox = createSprite(m.H * scale + 1000, m.W * scale / 2, 2000, m.W * scale);
    rightBox.shapeColor = color(0);
    walls.add(rightBox);
}

function newMazeAfterFinish() {
    newMaze(mazeStartWidth + mazesStarted * 2, mazeStartHeight + mazesStarted * 2, 0.02, 6);
}

function draw() {
    background(51);

    if (mazesStarted > numberOfMazes) {
        return;
    }

    camera.position.x = ((4 * camera.position.x + player.position.x + windowWidth / 2) / 5);
    camera.position.y = ((4 * camera.position.y + player.position.y + windowHeight / 2) / 5);

    ambientLight(0);
    spotLight(255, 255, 255, 0, 0, 1500, 0, 0, -1);

    updateVelocities();
    player.collide(walls, wallFriction);
    //player.collide(exit, newMazeAfterFinish);

    drawSprites(open);
    drawSprites(walls);
    // drawSprites(testWall);
    // drawSprites(testOpen);
    // drawSprites(testGroup);
    drawSprite(exit);
    drawSprite(player);
}

function wallFriction() {
    player.velocity.x /= 1.1;
    player.velocity.y /= 1.1;
}

function updateVelocities() {
    let a = keyDown('a'), d = keyDown('d'), w = keyDown('w'), s = keyDown('s');
    if (a ? d : !d) {
        player.velocity.x /= 1.2;
    } else if (a) {
        player.velocity.x = (9 * player.velocity.x - 12) / 10;
    } else if (d) {
        player.velocity.x = (9 * player.velocity.x + 12) / 10;
    }

    if (w ? s : !s) {
        player.velocity.y /= 1.2;
    } else if (w) {
        player.velocity.y = (9 * player.velocity.y - 12) / 10;
    } else if (s) {
        player.velocity.y = (9 * player.velocity.y + 12) / 10;
    }
}