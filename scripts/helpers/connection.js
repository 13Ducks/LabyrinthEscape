function die() {
    if (!isHost && allConnections.length == 1) {
        if (allConnections[0] && allConnections[0].open) {
            allConnections[0].send('die');
        }
    } else if (isHost) {
        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('die,' + myID);
            }
        }
    }

    minimap.revealAll();
    player.visible = false;
    deadPlayers.push(player);
    maxRenderDist = 10;
    maxSpeed = 30;
    isDead = true;
    heldItem = null;
}

function initializePeer() {
    peer = new Peer(myID, peerConfig);
    connectedToServer = false;

    peer.on('open', function (id) {
        connectedToServer = true;
        player = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
        allPlayers.add(player);
        playerPos[id] = player;
        connectionHost();
    });
}

function connectionHost() {
    peer.on('connection', function (conn) {
        isHost = true;
        allConnections.push(conn);

        conn.on('open', function () {
            conn.send('starthandshake');

            conn.on('data', function (data) {
                let splitData = data.split(',');
                switch (splitData[0]) {
                    case 'pos':
                        playerPos[conn.peer].position.x = +splitData[1];
                        playerPos[conn.peer].position.y = +splitData[2];
                        break;
                    case 'name':
                        idToName[conn.peer] = splitData[1];
                        menu.state = "CLIENTMODE";
                        menu.eventHandler("CREATE PARTY");

                        conn.send("name," + peer.id + "," + idToName[peer.id]);
                        for (let c in allConnections) {

                            if (allConnections[c].peer != conn.peer) {
                                conn.send("name," + allConnections[c].peer + "," + idToName[allConnections[c].peer]);
                                allConnections[c].send("name," + conn.peer + "," + idToName[conn.peer]);
                            }
                        }
                        break;
                    case 'die':
                        playerPos[conn.peer].visible = false;
                        deadPlayers.push(playerPos[conn.peer]);
                        for (let c of allConnections) {

                            if ((c && c.open) && (c.peer != conn.peer)) {
                                c.send('die,' + conn.peer);
                            }
                        }
                        break;
                    case 'poweruppicked':
                        powerupsInUse.push(+splitData[1]);
                        powerups[+splitData[1]].sprite.visible = false;
                        sendPowerupUsedInfo(+splitData[1]);
                        break;
                    case 'powerupdropped':
                        let pID = +splitData[1];
                        for (let p in powerupsInUse) {
                            if (powerupsInUse[p] == pID) {
                                powerupsInUse.splice(p, 1);
                            }
                        }
                        powerups[pID].sprite.visible = true;
                        powerups[pID].sprite.position.x = +splitData[2];
                        powerups[pID].sprite.position.y = +splitData[3];
                        powerups[pID].sprite.velocity.x = +splitData[4];
                        powerups[pID].sprite.velocity.y = +splitData[5];

                        if (['Boot', 'Torch'].includes(powerups[pID].constructor.name)) {
                            powerups[pID].timeAvailable = +splitData[6];
                        }

                        sendPowerupDroppedInfo(data);
                        break;
                }
            });
        });
        let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
        playerPos[conn.peer] = otherPlayer;

        menu.state = "CLIENTMODE";
        menu.eventHandler("CREATE PARTY");
    });
}

function sendPositionData() {
    if (!isHost && allConnections.length == 1) {
        if (allConnections[0] && allConnections[0].open) {
            allConnections[0].send('pos,' + player.position.x + ',' + player.position.y);
        }
    } else if (isHost) {
        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('pos,' + peer.id + ',' + player.position.x + ',' + player.position.y);
                for (let c2 in allConnections) {
                    if (allConnections[c2] && allConnections[c2].open && allConnections[c] != allConnections[c2]) {
                        let peerID = allConnections[c2].peer;
                        allConnections[c].send('pos,' + peerID + ',' + playerPos[peerID].position.x + ',' + playerPos[peerID].position.y);
                    }
                }
            }
        }
    }
}

function sendStartInfo() {
    let monsterID = Object.keys(playerPos)[floor(random() * Object.keys(playerPos).length)];
    monster = playerPos[monsterID];
    isMonster = player == monster;

    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send('start,' + mazeSeed + ',' + monsterID);
        }
    }
}

function sendPowerupUsedInfo(pIndex) {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send('poweruppicked,' + pIndex);
        }
    }
}

function sendPowerupDroppedInfo(dataStr) {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send(dataStr);
        }
    }
}