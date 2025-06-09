// Physics handling

function areRectanglesColliding(rect1, rect2) {
    let noHorizontalOverlap = rect1.pos.x + rect1.w <= rect2.pos.x || rect2.pos.x + rect2.w <= rect1.pos.x;
    let noVerticalOverlap = rect1.pos.y + rect1.h <= rect2.pos.y || rect2.pos.y + rect2.h <= rect1.pos.y;
    return !(noHorizontalOverlap || noVerticalOverlap);
}

function firstColliding(obj1, tag) {
    let objToCheck = [];
    objToCheck = get(tag);

    let returnVal = false;

    objToCheck.forEach((obj2) => {
        if(areRectanglesColliding(obj1, obj2)) returnVal = obj2;
    })

    return returnVal;
}

function isColliding(obj1, tag) {
    let objToCheck = [];

    for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
            objToCheck = objToCheck.concat(get(`inPos${parseInt(obj1.pos.x/CollisionTileSize)+i}/${parseInt(obj1.pos.y/CollisionTileSize)+j}`));
        }
    }

    let returnVal = false;

    objToCheck.forEach((obj2) => {
        if(obj2.is(tag) && areRectanglesColliding(obj1, obj2)) returnVal = true;
    })

    return returnVal;

}

function collidingAttackable(obj1, tag, rotated = false) {
    let returnVal = [];
    let objToCheck = [];

    objToCheck = objToCheck.concat(get("attackable"));

    objToCheck.forEach((obj2) => {
        if(!rotated) if(!returnVal.includes(obj2) && areRectanglesColliding(obj1, obj2)) returnVal.push(obj2);

        if(rotated) if(!returnVal.includes(obj2) && areRectanglesCollidingRotate(obj1, obj2)) returnVal.push(obj2);
    })

    return returnVal;
}

function collidingList(obj1, tag, rotated = false) {
    let returnVal = [];
    let objToCheck = [];

    for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
            objToCheck = objToCheck.concat(get(`inPos${parseInt(obj1.pos.x/CollisionTileSize)+i}/${parseInt(obj1.pos.y/CollisionTileSize)+j}`));
        }
    }

    objToCheck.forEach((obj2) => {
        if(!rotated) if(obj2.is(tag) && !returnVal.includes(obj2) && areRectanglesColliding(obj1, obj2)) returnVal.push(obj2);

        if(rotated) if(obj2.is(tag) && !returnVal.includes(obj2) && areRectanglesCollidingRotate(obj1, obj2)) returnVal.push(obj2);
    })
    return returnVal;
}

function collidingListId(obj1, tag) {
    // tag = "solid";
    let returnVal = [];
    let objToCheck = [];

    for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
            objToCheck = objToCheck.concat(get(`inPos${parseInt(obj1.pos.x/CollisionTileSize)+i}/${parseInt(obj1.pos.y/CollisionTileSize)+j}`));
        }
    }
    objToCheck.forEach((obj2) => {
        if(obj2.is(tag) && areRectanglesColliding(obj1, obj2)) returnVal.push(obj2.id);
    })
    return returnVal;
}

function addColliding(obj) {
    let o = add([
        rect(obj.width, obj.height),
        pos(obj.x, obj.y),
        // opacity(0),
        {
            w: obj.width,
            h: obj.height,
        },
    ])
    if(obj.tags) obj.tags.forEach((el) => o.tag(el));
    if(obj.z) o.use(z(obj.z));
    if(obj.opacity) o.use(opacity(obj.opacity));
    else o.use(opacity(DebugOpacity));

    if(obj.otherProperties) {
        Object.keys(obj.otherProperties).forEach((el) => {
            o[el] = obj.otherProperties[el];
        })
    }

    if(obj.sprObj) o.sprObj = obj.sprObj;
    for(let posX = Math.floor(obj.x/CollisionTileSize); posX <= Math.ceil((obj.x+obj.width)/CollisionTileSize); posX++) {
        for(let posY = Math.floor(obj.y/CollisionTileSize); posY <= Math.ceil((obj.y+obj.height)/CollisionTileSize); posY++) {
            o.use(`inPos${posX}/${posY}`);
        }
    }
    return o;
}

function isGrounded(obj) {
    let beforeCollideId = collidingListId(obj, "solid");
    obj.pos.y += 1;
    let afterCollideId = collidingListId(obj, "solid");
    let newCollisions = false;

    afterCollideId.forEach(o => {
        if(!beforeCollideId.includes(o)) {
            newCollisions = true;
        }
    })
    obj.pos.y -= 1;
    return newCollisions;
}

function groundedObj(obj) {
    let beforeCollideId = collidingListId(obj, "solid");
    obj.pos.y += 1;
    let afterCollideId = collidingListId(obj, "solid");
    let newCollisions = false;

    afterCollideId.forEach(o => {
        if(!beforeCollideId.includes(o)) {
            newCollisions = o;
        }
    })
    obj.pos.y -= 1;
    return newCollisions;
}

// addColliding({
//     x: -1000/2, y: TileSize*(levelsTile[level].length+2),
//     width: TileSize*(levelsTile[level][0].length+2)+2000/2, height: 100/2,
//     tag: "kill"
// })

// make things move

function getPlayerMovements(playerObj) {
    // gravity
    if(keyDown("up")) playerObj.velY = Math.min(playerObj.velY + 1.6, 36);
    else if(keyDown("down")) playerObj.velY = Math.min(playerObj.velY + 2.4, 36);
    else playerObj.velY = Math.min(playerObj.velY + 2, 36);
    
    // inercia
    if(isGrounded(playerObj)) {
        if(Math.abs(playerObj.velX) < 2) playerObj.velX = 0;
        else playerObj.velX = (playerObj.velX * 0.75);
    } else {
        if(Math.abs(playerObj.velX) < 2) playerObj.velX = 0;
        else playerObj.velX = (playerObj.velX * 0.75); // antes era 0.95
    }
    // playerObj.velX = 0;

    if(isGrounded(playerObj)) playerObj.canJump = true;
    let velYBoost = 20, velXBoost = 6;

    if(playerObj.atkCd == 1) {
        playerObj.inAtk = false;
        playerObj.sprObj.spr = playerObj.sprObj.lastSpr;
        playerObj.sprObj.curFrame = 0;
    }
    if(playerObj.atkCd > 0) playerObj.atkCd--;

    if(playerObj.canJump && (keyDown("jump")) && !playerObj.inAtk) {
        playerObj.velY = -velYBoost;
        playerObj.canJump = false;
    }
    let moveVelX = 0;
    if(keyDown("left") && !playerObj.inAtk) {
        moveVelX -= velXBoost;
        playerObj.face = -1;
    }
    if(keyDown("right") && !playerObj.inAtk) {
        moveVelX += velXBoost;
        playerObj.face = 1;
    }
    if(moveVelX && isGrounded(playerObj) && playerObj.sprObj.spr != "playerAttack" && playerObj.sprObj.spr != "playerRun") {
        playerObj.sprObj.spr = playerObj.sprObj.lastSpr = "playerRun";
        playerObj.sprObj.curFrame = 0;
    }
    else if(!isGrounded(playerObj) && playerObj.sprObj.spr != "playerAttack" && playerObj.sprObj.spr != "playerJump" && playerObj.velX != 0) {
        playerObj.sprObj.spr = playerObj.sprObj.lastSpr = "playerJump";
        playerObj.sprObj.curFrame = 0;
    }
    else if(playerObj.sprObj.spr != "playerAttack" && !moveVelX && isGrounded(playerObj)) {
        playerObj.sprObj.spr = playerObj.sprObj.lastSpr = "playerIdle";
    }


    if(playerObj.velX > -velXBoost && moveVelX == -velXBoost) playerObj.velX = Math.max(playerObj.velX + moveVelX, -velXBoost);
    if(playerObj.velX < velXBoost && moveVelX == velXBoost) playerObj.velX = Math.min(playerObj.velX + moveVelX, velXBoost);
    
    if(playerObj.atkCd == 0 && keyPressed("atk")) {
        playerAttack(playerObj);
    }

    // playerObj.velX = playerObj.moveVelX;
}

function getMovements(obj, playerObj) {
    // gravity
    obj.velY = Math.min(obj.velY + 2 + (obj.is("slowedGravity")?-1:0), 36);
    
    // inercia
    if(isGrounded(obj)) {
        if(Math.abs(obj.velX) < 2) obj.velX = 0;
        else obj.velX = (obj.velX * 0.75);
    } else {
        if(Math.abs(obj.velX) < 2) obj.velX = 0;
        else obj.velX = (obj.velX * 0.75); // antes era 0.95
    }
    
    if(obj.is("hornRabbit")) {
        if(obj.inAtk) return;
        if(obj.aimingCd > 0) {
            obj.aimingCd--;
            if(obj.aimingCd == 0) {
                obj.inAtk = true;
                obj.boostX = obj.moveVelX*5;
            }
        } else {
            if(playerObj.pos.y + playerObj.h == obj.pos.y + obj.h && isGrounded(playerObj) && isGrounded(obj) && groundedObj(playerObj) == groundedObj(obj)) {
                if((playerObj.pos.x + playerObj.w/2 > obj.pos.x + obj.w && obj.moveVelX > 0) || (playerObj.pos.x + playerObj.w/2 < obj.pos.x + obj.w && obj.moveVelX < 0)) {
                    obj.boostX = -obj.moveVelX/2;
                    obj.aimingCd = 15;
                }
            }
        }
    }

    if(obj.is("rabbit")) {
        if(isGrounded(obj)) {
            obj.velY = -15;
            obj.boostX = obj.moveVelX;
        } else {
            obj.boostX = 0.9*(obj.boostX??0);
        }
    }
}

function playerAttack(playerObj) {
    playerObj.sprObj.spr = "playerAttack";
    playerObj.sprObj.curFrame = 0;
    playerObj.inAtk = true;
    playerObj.atkCd = 10;
    // playerObj.sprObj.use(sprite("playerAttack"));
    // playerObj.sprObj.play("run");
}

function updatePlayerAttack(playerObj) {
    if(playerObj.atkCd != 2) return; // sprite certo de ataque
    let atkObj;
    if(playerObj.face == 1) atkObj = playerObj.atkObjR;
    else atkObj = playerObj.atkObjL;

    let colList = collidingList(atkObj, "attackable");
    if(colList.length) {
        // playerObj.velY = 0;
        if(playerObj.atkCd == 5) playerObj.canJump = true;
        playerObj.canJump = true;
        ImpactFrameCd = 5;
        let maxMass = 0;
        colList.forEach((el) => {
            maxMass = Math.max(el.mass, maxMass);
            if(el.mass == -1) maxMass = -1;
        })
        if(maxMass != -1) shake(2*Math.sqrt(maxMass));
        else shake(2*4);
        colList.forEach((el) => {
            if(el.mass != -1 && el.mass) {
                el.velX += (playerObj.face)*(playerObj.mass)*Momentum/(playerObj.mass + el.mass);
                el.velY = -(playerObj.mass)*playerObj.attackForce/(playerObj.mass + el.mass);
            }
            if(el.sprObj) {
                el.sprObj.use(shader("whiten", () => ({
                    "qtd": 0.5,
                })));
            }
            el.untag("attackable");
            el.tag("attackableCooldown");
            el.canBeAttackedCd = 5 + ImpactFrameCd;
            playerObj.addThrust = true;
            console.log(el.health);
            el.health--;
            if(el.health == 0) {
                if(el.sprObj) el.sprObj.destroy();
                el.destroy();
            }
        })
        // vel*Massa = vel*Massa = 5
        // momentum * player.mass = momentumFinal*el.mass + momentumFinal*player.mass;
        // playerObj.velX = -momentum;
        if(maxMass == -1) playerObj.velX += (-playerObj.face)*Momentum;
        else playerObj.velX += (-playerObj.face)*(maxMass)*Momentum/(playerObj.mass + maxMass);
        // console.log(maxMass);
    }
    // console.log(colList);
}

function updateCamera(playerObj) {
    let oldCam = camPos();
    let newPos = {x: playerObj.pos.x + (playerObj.face == -1?-80/2:80/2), y: playerObj.pos.y-80/2};
    camPos(oldCam.x + (newPos.x - oldCam.x)*0.15, oldCam.y + (newPos.y - oldCam.y)*0.150);

    bgSprite.pos.x = bgSprite.pos.x + (-playerObj.pos.x/3 - bgSprite.pos.x)*0.15;
    bgSprite.pos.y = bgSprite.pos.y + (-playerObj.pos.y/3 - bgSprite.pos.y)*0.15;
}

function movePlayer(playerObj) {
    let beforeCollideId = collidingListId(playerObj, "solid");

    if(playerObj.velY >= 0) {
        let wasGrounded = isGrounded(playerObj);
        playerObj.pos.y += playerObj.velY;
        let afterCollideId = collidingListId(playerObj, "solid");
        let afterCollide = collidingList(playerObj, "solid");
        let newCollisions = [];

        afterCollideId.forEach(obj => {
            if(!beforeCollideId.includes(obj)) {
                newCollisions.push(obj);
            }
        })

        if(newCollisions.length > 0) {
            playerObj.velY = 0;
        }

        afterCollide.forEach(obj => {
            if(newCollisions.includes(obj.id)) {
                playerObj.pos.y = Math.min(playerObj.pos.y, obj.pos.y - playerObj.h);
            }
        })
    } else {
        playerObj.pos.y += playerObj.velY;
        let afterCollideId = collidingListId(playerObj, "solid");
        let afterCollide = collidingList(playerObj, "solid");
        let newCollisions = [];

        afterCollideId.forEach(obj => {
            if(!beforeCollideId.includes(obj)) {
                newCollisions.push(obj);
            }
        })

        if(newCollisions.length > 0) {
            playerObj.velY = 0;
        }

        afterCollide.forEach(obj => {
            if(newCollisions.includes(obj.id)) {
                playerObj.pos.y = Math.max(playerObj.pos.y, obj.pos.y + obj.h);
            }
        })
    }

    if(playerObj.velX >= 0) {
        playerObj.pos.x += playerObj.velX;
        let afterCollideId = collidingListId(playerObj, "solid");
        let afterCollide = collidingList(playerObj, "solid");
        let newCollisions = [];

        afterCollideId.forEach(obj => {
            if(!beforeCollideId.includes(obj)) {
                newCollisions.push(obj);
            }
        })

        if(newCollisions.length > 0) {
            playerObj.velX = 0;
            movementVel = 0;
        }

        afterCollide.forEach(obj => {
            if(newCollisions.includes(obj.id)) {
                playerObj.pos.x = Math.min(playerObj.pos.x, obj.pos.x - playerObj.w);
            }
        })
    } else {
        playerObj.pos.x += playerObj.velX;
        let afterCollideId = collidingListId(playerObj, "solid");
        let afterCollide = collidingList(playerObj, "solid");
        let newCollisions = [];

        afterCollideId.forEach(obj => {
            if(!beforeCollideId.includes(obj)) {
                newCollisions.push(obj);
            }
        })

        if(newCollisions.length > 0) {
            playerObj.velX = 0;
            movementVel = 0;
        }

        afterCollide.forEach(obj => {
            if(newCollisions.includes(obj.id)) {
                playerObj.pos.x = Math.max(playerObj.pos.x, obj.pos.x + obj.w);
            }
        })
    }
}



function moveObj(movingObj, playerObj) {
    let beforeCollideId = collidingListId(movingObj, "solid");

    if(movingObj.velY >= 0) {
        let wasGrounded = isGrounded(movingObj);
        movingObj.pos.y += movingObj.velY;
        let afterCollideId = collidingListId(movingObj, "solid");
        let afterCollide = collidingList(movingObj, "solid");
        let newCollisions = [];

        afterCollideId.forEach(obj => {
            if(!beforeCollideId.includes(obj)) {
                newCollisions.push(obj);
            }
        })

        if(newCollisions.length > 0) {
            movingObj.velY = 0;
        }

        afterCollide.forEach(obj => {
            if(newCollisions.includes(obj.id)) {
                movingObj.pos.y = Math.min(movingObj.pos.y, obj.pos.y - movingObj.h);
            }
        })
    } else {
        movingObj.pos.y += movingObj.velY;
        let afterCollideId = collidingListId(movingObj, "solid");
        let afterCollide = collidingList(movingObj, "solid");
        let newCollisions = [];

        afterCollideId.forEach(obj => {
            if(!beforeCollideId.includes(obj)) {
                newCollisions.push(obj);
            }
        })

        if(newCollisions.length > 0) {
            movingObj.velY = 0;
        }

        afterCollide.forEach(obj => {
            if(newCollisions.includes(obj.id)) {
                movingObj.pos.y = Math.max(movingObj.pos.y, obj.pos.y + obj.h);
            }
        })
    }

    if(movingObj.velX + movingObj.moveVelX + (movingObj.boostX ?? 0) >= 0) {
        movingObj.pos.x += movingObj.velX + movingObj.moveVelX  + (movingObj.boostX ?? 0);
        let afterCollideId = collidingListId(movingObj, "solid");
        let afterCollide = collidingList(movingObj, "solid");
        let newCollisions = [];

        afterCollideId.forEach(obj => {
            if(!beforeCollideId.includes(obj)) {
                newCollisions.push(obj);
            }
        })

        if(newCollisions.length > 0) {
            if(movingObj.inAtk) {
                movingObj.inAtk = false;
                movingObj.boostX = 0;
            }
            movingObj.velX = 0;
            movingObj.moveVelX *= -1;

            movementVel = 0;
        } else if(isGrounded(movingObj) && movingObj.moveVelX + (movingObj.boostX ?? 0) >= 0) {
            movingObj.pos.x += movingObj.w;
            if(!isGrounded(movingObj)) {
                movingObj.velX = 0;
                if(movingObj.inAtk) {
                    movingObj.inAtk = false;
                    movingObj.boostX = 0;
                }
                movingObj.moveVelX *= -1;

                movementVel = 0;
            }
            movingObj.pos.x -= movingObj.w;
        }

        afterCollide.forEach(obj => {
            if(newCollisions.includes(obj.id)) {
                movingObj.pos.x = Math.min(movingObj.pos.x, obj.pos.x - movingObj.w);
            }
        })
    } else {
        movingObj.pos.x += movingObj.velX + movingObj.moveVelX  + (movingObj.boostX ?? 0);
        let afterCollideId = collidingListId(movingObj, "solid");
        let afterCollide = collidingList(movingObj, "solid");
        let newCollisions = [];

        afterCollideId.forEach(obj => {
            if(!beforeCollideId.includes(obj)) {
                newCollisions.push(obj);
            }
        })

        if(newCollisions.length > 0) {
            if(movingObj.inAtk) {
                movingObj.inAtk = false;
                movingObj.boostX = 0;
            }
            movingObj.velX = 0;
            movingObj.moveVelX *= -1;
            movementVel = 0;
        } else if(isGrounded(movingObj) && movingObj.moveVelX + (movingObj.boostX ?? 0) <= 0) {
            movingObj.pos.x -= movingObj.w;
            if(!isGrounded(movingObj)) {
                if(movingObj.inAtk) {
                    movingObj.inAtk = false;
                    movingObj.boostX = 0;
                }
                movingObj.velX = 0;
                movingObj.moveVelX *= -1;

                movementVel = 0;
            }
            movingObj.pos.x += movingObj.w;
        }

        afterCollide.forEach(obj => {
            if(newCollisions.includes(obj.id)) {
                movingObj.pos.x = Math.max(movingObj.pos.x, obj.pos.x + obj.w);
            }
        })
    }

    if(movingObj.sprObj) {
        if(movingObj.moveVelX > 0 && movingObj.face == 1) {
            movingObj.sprObj.stop();
            movingObj.face = 0;
            movingObj.sprObj.use(sprite(movingObj.sprObj.spr, {flipX: 0}));
            movingObj.sprObj.play("run", {loop: true, speed: (movingObj.sprObj.animSpd ?? 12)});
        }
        else if(movingObj.moveVelX < 0 && movingObj.face == 0) {
            movingObj.sprObj.stop();
            movingObj.face = 1;
            movingObj.sprObj.use(sprite(movingObj.sprObj.spr, {flipX: 1}));
            movingObj.sprObj.play("run", {loop: true, speed: (movingObj.sprObj.animSpd ?? 12)});
        }

        if(movingObj.sprObj.sprOffset) {
            
        }
        movingObj.sprObj.pos.x = movingObj.pos.x + (movingObj.sprOffset?movingObj.sprOffset.x:0), movingObj.sprObj.pos.y = movingObj.pos.y + (movingObj.sprOffset?movingObj.sprOffset.y:0);
    }
    
    if(movingObj.is("enemy")) {
        if(areRectanglesColliding(movingObj, playerObj) && playerObj.attackableCd == 0) {
            ImpactFrameCd = 5;
            playerObj.attackableCd = 15 + ImpactFrameCd;

            let dir;
            if(movingObj.pos.x + movingObj.w/2 < playerObj.pos.x + playerObj.w/2) dir = -1;
            else dir = 1;

            if(movingObj.mass != -1 && movingObj.mass) {
                movingObj.velX += (dir)*(playerObj.mass)*(movingObj.attackForce ?? Momentum)/(playerObj.mass + movingObj.mass);
            }

            if(movingObj.mass == -1) playerObj.velX += (-dir)*(movingObj.attackForce ?? Momentum);
            else playerObj.velX += (-dir)*(movingObj.mass)*(movingObj.attackForce ?? Momentum)/(playerObj.mass + movingObj.mass);
            
            playerObj.velY = -1/2*(movingObj.mass)*(movingObj.attackForce ?? Momentum)/(playerObj.mass + movingObj.mass);
            playerObj.sprObj.use(shader("whiten", () => ({
                "qtd": 0.5,
            })));
            shake(2*Math.sqrt(playerObj.mass));
            debug.log("hurt");
        }
    }
}

let textBox;

let textBoxText;
let alreadyHasUpText = false, alreadyHasUpBg;
/* ----- Miscellaneous ---- */
function updateSign(playerObj) {
    let placa = firstColliding(playerObj, "placa");
    if(placa && alreadyHasUpText == false) {
        alreadyHasUpBg = add([
            rect(180, 48),
            pos(placa.pos.x-66, placa.pos.y + 68),
            opacity(0.5),
            color([0, 0, 0]),
            z(7)
        ])
        alreadyHasUpText = add([
            text("Seta para baixo\npara ler", {size: 18, align: "center"}),
            pos(placa.pos.x-58, placa.pos.y + 76),
            z(8)
        ])
    }
    if(!placa && alreadyHasUpText) {
        alreadyHasUpText.destroy(); alreadyHasUpText = false;
        alreadyHasUpBg.destroy();
    }
    if(!keyPressed("down")) return;
    if(signPaused) {
        textBox.destroy();
        textBoxText.destroy();
        setaParaSair.destroy();
        signPaused = false;
    } else {
        if(placa) {
            debug.log("lerPlaca");
            textBox = add([
                sprite("dialBox"),
                scale(4),
                anchor("center"),
                pos(400, 450),
                fixed(),
                z(9)
            ]);
            textBoxText = add([
                text(placa.txt, {size: 24}),
                anchor("center"),
                pos(400, 450),
                fixed(),
                z(10),
            ]);
            setaParaSair = add([
                text("Seta para baixo para continuar", {size: 12}),
                pos(450, 500),
                fixed(),
                z(10),
            ])
            signPaused = true;
        }
    }
}

let PtextBox;

let PtextBoxText;
let PalreadyHasUpText = false, PalreadyHasUpBg;

async function updatePortal(playerObj, level) {
    let portal = firstColliding(playerObj, "portal");
    if(portal && PalreadyHasUpText == false) {
        PalreadyHasUpBg = add([
            rect(180, 48),
            pos(portal.pos.x-66, portal.pos.y + 68 + TileSize),
            opacity(0.5),
            color([0, 0, 0]),
            z(7)
        ])
        PalreadyHasUpText = add([
            text("Seta para baixo\npara entrar", {size: 18, align: "center"}),
            pos(portal.pos.x-58, portal.pos.y + 76 + TileSize),
            z(8)
        ])
    }
    if(!portal && PalreadyHasUpText) {
        PalreadyHasUpText.destroy(); PalreadyHasUpText = false;
        PalreadyHasUpBg.destroy();
    }

    if(!keyPressed("down")) return;
    if(portal) {
        gamePaused = true;
        exitScene(playerObj, portal.spritee);
        // go("game", level+1);
    }
}