// GAMESTATE
let gameState = "MENU";
let menu;
let game;
let peer;

// IMAGES
const allAssets = { floor: [], wall: [], knife: [], torch: [], gps: [], flare: [], hammer: [], boots: [] }
const lightInt = 1;
let assetsLoaded = 0;
const totalAssets = (101 / lightInt) * Object.keys(allAssets).length;

// MENU
const validCharacters = "qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM ";
const maxUsernameLength = 10;
const connectionFailTime = 5000;

// P2P
let allConnections = [];
const idLength = 6;
let myID;
for (myID = ''; myID.length < idLength; myID += validCharacters[Math.floor(Math.random() * (validCharacters.length - 1))]);
let isHost = false;
let playerPos = {};
let finishedPlayers;
let allPlayers;
let deadPlayers = [];
let connectedToServer;
let idToName = {};
const partySizeMinimum = 1;
const partySizeMaximum = 5;
const peerConfig = {
    secure: true,
    host: 'labyrinth-escape.herokuapp.com',
    port: 443
};

// VIEWPORT
const desiredFPS = 30;
const originalScale = 120;
let scale = originalScale;
const trueMaxRenderDist = 4;
let maxRenderDist = trueMaxRenderDist;
const uiPadding = 30;

// PLAYER
let player;
const friction = 9;
const trueMaxSpeed = 6;
const spectatorMaxSpeed = 4;
let maxSpeed = trueMaxSpeed;
let isMonster;
let heldItem = null;
let orientation = 0;
let isDead = false;
let spectating = false;

// MAZE
let m;
let walls;
let exit;
let powerups;
let powerupsInUse;
let border;
let monster;
let originalMonsterLoc;

let mazeSeed;

let numberOfMazes = 3;
let mazeStartWidth = 14;
let mazeStartHeight = 14;
let holeProbability = 0.02;
const powerUpNum = 6;
const mazeGrow = 2;

let mazesStarted = 0;

let alertMsg = '';
let alertTime = 0;
const alertRate = 5;
const alertMaxTime = 855;

// MINIMAP
let minimap;
let minimapScale;
const minimapPercent = 0.3;

// FONTS
let font;

// COLORS
const gameColors = {
    player: '#ff5252',
    back: '#f7f1e3',
    power: '#34ace0',
    start: '#33d9b2',
    end: '#ffb142',
    wall: '#000000',
    minimap: '#d1ccc0',
    inv: '#8c8c89',
}

function resetAllValues() {
    gameState = "MENU";
    game = null;
    finishedPlayers = null;
    deadPlayers = [];
    maxRenderDist = trueMaxRenderDist;
    maxSpeed = trueMaxSpeed;
    isMonster = null;
    heldItem = null;
    orientation = 0;
    isDead = false;
    tempDead = false;
    spectating = false;
    m = null;
    walls = null;
    exit = null;
    powerups = null;
    powerupsInUse = null;
    border = null;
    monster = null;
    mazeSeed = null;
    mazesStarted = 0;
    alertMsg = '';
    alertTime = 0;
    minimap = null;
    minimapScale = null;
    scale = originalScale;
    originalMonsterLoc = [];

    for (let spr of getSprites()) {
        let isPlayer = false;
        for (let p of allPlayers) {
            if (p == spr) {
                isPlayer = true;
            }
        }

        if (!isPlayer)
            spr.remove();
    };
}

function resetConn() {
    for (let spr of getSprites()) spr.remove();
    for (let c of allConnections) { c.close(); }
    allConnections = [];

    playerPos = {};
    const myName = idToName[myID];
    idToName = [];
    idToName[myID] = (myName ? myName : myID);
    isHost = false;

    initMenus();
    menu = new Menu();
    menu.changeMenu(...mainMenu);
    allPlayers = new Group();

    player = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
    allPlayers.add(player);
    playerPos[myID] = player;
}
