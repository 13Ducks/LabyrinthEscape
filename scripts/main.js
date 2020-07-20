function preload() {
    font = loadFont('assets/mozart.ttf');

    let player_frames_front = [
        { 'name': 'player_front_walk01', 'frame': { 'x': 0, 'y': 0, 'width': 32, 'height': 32 } },
        { 'name': 'player_front_walk02', 'frame': { 'x': 32, 'y': 0, 'width': 32, 'height': 32 } },
    ];

    let player_frames_back = [
        { 'name': 'player_back_walk01', 'frame': { 'x': 64, 'y': 0, 'width': 32, 'height': 32 } },
        { 'name': 'player_back_walk02', 'frame': { 'x': 0, 'y': 32, 'width': 32, 'height': 32 } },
    ];

    let player_frames_right = [
        { 'name': 'player_right_walk01', 'frame': { 'x': 32, 'y': 32, 'width': 32, 'height': 32 } },
        { 'name': 'player_right_walk02', 'frame': { 'x': 64, 'y': 32, 'width': 32, 'height': 32 } },
    ];

    let player_frames_left = [
        { 'name': 'player_left_walk01', 'frame': { 'x': 0, 'y': 64, 'width': 32, 'height': 32 } },
        { 'name': 'player_left_walk02', 'frame': { 'x': 32, 'y': 64, 'width': 32, 'height': 32 } },
    ];

    for (let key of Object.keys(playerSprites)) {
        playerSprites[key]['front'] = loadAnimation(loadSpriteSheet('assets/players/' + key + '.png', player_frames_front));
        playerSprites[key]['back'] = loadAnimation(loadSpriteSheet('assets/players/' + key + '.png', player_frames_back));
        playerSprites[key]['left'] = loadAnimation(loadSpriteSheet('assets/players/' + key + '.png', player_frames_left));
        playerSprites[key]['right'] = loadAnimation(loadSpriteSheet('assets/players/' + key + '.png', player_frames_right));
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(desiredFPS);
    imageMode(CENTER);
    angleMode(DEGREES);
    noSmooth();

    for (let i = 1; i <= numTutorialPages; i++)
        tutorialPages.push(loadImage("assets/tutorial/" + i + ".png", img => { assetsLoaded++; }));

    for (let key of Object.keys(allAssets))
        for (let i = 0; i <= 100; i += lightInt)
            allAssets[key].push(loadImage("assets/" + key + "/opaque" + i + '.png', img => { assetsLoaded++; }));

    resetAllValues();
    resetConn();

    if (Modernizr.peerconnection) {
        menu.changeMenu(...startNameMenu);
        initializePeer();
    } else {
        menu.changeMenu(...notSupportedMenu);
    }

    fontSizeRatio = round((windowWidth / fontDefaultWidth) * 100) / 100;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    fontSizeRatio = round((windowWidth / fontDefaultWidth) * 100) / 100;
    if (gameState == "GAME") {
        if (spectating) changeScale(correctScale() / 2);
        else changeScale(correctScale());
    }
}

function draw() {
    if (assetsLoaded < totalAssets || !connectedToServer) {
        const percentLoaded = floor(100 * (assetsLoaded + 1) / (totalAssets + 1));
        const loadString = percentLoaded + '% (' + (assetsLoaded + 1) + '/' + (totalAssets + 1) + ')';
        drawBasicMenu('Loading...', (percentLoaded == 100 ? 'Awaiting Server Connection' : loadString), []);
    } else {
        if (gameState == "MENU") menu.draw();
        else if (gameState == "GAME") game.draw();
    }
}

function keyPressed() {
    switch (gameState) {
        case "MENU":
            menu.handleKey(keyCode, key);
    }

    return false;
}
