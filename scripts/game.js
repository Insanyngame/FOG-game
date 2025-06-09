scene("game", (level) => {

load_ascii(level);

const playerStartPos = {x: 100, y: 0};
const playerSprOffset = {x: -84, y: -94};
let playerAtkOffset = {x: 26, y: 4};

camPos(playerStartPos.x, playerStartPos.y);
let player = add([
    pos(playerStartPos.x, playerStartPos.y),
    opacity(DebugOpacity),
    {
        face: 1,
        w: 26, h: 68,
        moveVelX: 0,
        velX: 0,
        velY: 0,
        mass: 5,
        canJump: false,
        atkCd: 0,
        attackableCd: 0,
        inAtk: false,
        sprObj: add([
            sprite("playerIdle0"),
            pos(playerStartPos.x + playerSprOffset.x, playerStartPos.y + playerSprOffset.y),
            scale(2),
            z(1),
            {
                curFrame: 0,
                spr: "playerIdle",
                lastSpr: "playerIdle"
            }
        ]),
        atkObjR: add([
            opacity(DebugOpacity/2),
            rect(70, 50),
            pos(0, 0),
            // pos(playerStartPos.x + playerAtkOffset.x, playerStartPos.y+playerAtkOffset.y),
            {
                w: 70, h: 50,
            }
        ]),
        atkObjL: add([
            opacity(DebugOpacity/2),
            rect(70, 50),
            pos(0, 0),
            // pos(playerStartPos.x + playerAtkOffset.x, playerStartPos.y+playerAtkOffset.y),
            {
                w: 70, h: 50,
            }
        ]),
        attackForce: 20,
        addThrust: false
    },
    "player"
])
// player.atkCd = 0;
// player.inAtk = false;
player.use(rect(player.w, player.h));

// walls
// for(obj of rectanglePositions.template) {
//     addColliding(obj);
// }

// addColliding({
//     x: 100, y: 100,
//     width: 50, height: 800,
//     tags: ["solid", "attackable"],
//     otherProperties: {
//         mass: -1,
//     }
// })
let lastTime = performance.now();

function updateSubObjects(playerObj) {
    playerObj.sprObj.pos.x = playerObj.pos.x + playerSprOffset.x;
    playerObj.sprObj.pos.y = playerObj.pos.y + playerSprOffset.y;
    // 
    //  animationFPS[player.sprObj.spr]);
    // animationFPS[player.sprObj.spr];
    playerObj.sprObj.curFrame += animationFPS[player.sprObj.spr];
    playerObj.sprObj.curFrame = playerObj.sprObj.curFrame.toPrecision(2);
    playerObj.sprObj.curFrame %= animationLenth[player.sprObj.spr];
    playerObj.sprObj.use(sprite(`${playerObj.sprObj.spr}${Math.floor(player.sprObj.curFrame)}`, {flipX: playerObj.face == -1}));
    // playerObj.sprObj.play(`frame${Math.floor(player.sprObj.curFrame)}`, {speed: 60});
    
    playerObj.atkObjR.pos.x = playerObj.pos.x + playerObj.w;
    playerObj.atkObjR.pos.y = playerObj.pos.y + playerAtkOffset.y;
    playerObj.atkObjL.pos.x = playerObj.pos.x - playerObj.atkObjL.w;
    playerObj.atkObjL.pos.y = playerObj.pos.y + playerAtkOffset.y;
}

let thrustColors = [[255, 0, 0], [255, 128, 0], [255, 255, 0], [128, 255, 0], [0, 255, 0], [0, 255, 128], [0, 255, 255], [0, 128, 255], [0, 0, 255], [128, 0, 255]];
let thrustColorsCount = 0;

setCamScale(1);

/* -------------------- Main Loop -------------------- */
onUpdate(() => {
    // FPS control
    let deltaTime = performance.now() - lastTime;
    if(deltaTime < 1000/60) return;
    lastTime = performance.now();

    if(gamePaused) return;
    updateKeyPressed();
    updateSign(player);
    updatePortal(player, level);
    if(signPaused) return;

    if(ImpactFrameCd > 0) {
        ImpactFrameCd--;
        if(ImpactFrameCd == 0 && player.addThrust) {
            player.addThrust = false;
            console.log("addThrust");
            let thrust = add([
                // opacity(0.8),
                // rect(10, 10),
                color(thrustColors[thrustColorsCount][0], thrustColors[thrustColorsCount][1], thrustColors[thrustColorsCount][2]),
                sprite("thrust", {flipX: (player.face == -1)}),
                // shader("whiten", () => ({
                    //     "qtd": 1
                    // })),
                    pos(player.pos.x+player.w/2, player.pos.y + 30),
                    scale(4),
                    anchor((player.face == 1?"left":"right")),
                    z(5)
                ])
                thrustColorsCount++;
                thrustColorsCount %= thrustColors.length;
                thrust.play("run");
                wait(1).then(() => thrust.destroy());
        }
        return;
    }

    if(player.attackableCd > 0) {
        if(player.attackableCd == 5) player.sprObj.unuse("shader");
        player.attackableCd--;
    }
    
    get("attackableCooldown").forEach((el) => {
        el.canBeAttackedCd--;
        if(el.canBeAttackedCd < 10) {
            if(el.sprObj) el.sprObj.unuse("shader");
        }
        if(el.canBeAttackedCd == 0) {
            el.unuse("attackableCooldown");
            el.use("attackable");
        }
    })

    getPlayerMovements(player);
    movePlayer(player);
    get("enemy").forEach((sacoDePancada) => {
        if(sacoDePancada.pos.x + sacoDePancada.w < camPos().x - 800 || sacoDePancada.pos.x > camPos().x + 800
        || sacoDePancada.pos.y + sacoDePancada.h < camPos().y - 800 || sacoDePancada.pos.y > camPos().y + 800) return;
        getMovements(sacoDePancada, player);
        moveObj(sacoDePancada, player);
    })

    updateSubObjects(player);
    updatePlayerAttack(player);
    updateCamera(player);
    // player.velY = 20;
})

})

go("game", 1);