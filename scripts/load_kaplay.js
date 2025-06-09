// python3 -m http.server 8080

const CollisionTileSize = 200;
const TotalDashCooldown = 8;
const TileSize = 64;
const TextSize = 18;
const Momentum = 40;
const DebugOpacity = 0;
let ImpactFrameCd = 0;
let signPaused = false;
let gamePaused = false;
let bgSprite = {
    pos: {
        x: 0,
        y: 0,
    }
};

kaplay({
    background: [130, 130, 150],
    width: 800,
    height: 600,
    stretch: true,
    letterbox: true,
})

add([
    rect(800, 600),
    pos(0, 0),
    color(BLACK)
])

// let animObj = {};
let animObj = (n) => {
    obj = {
        "run": {from: 0, to: n, speed: 45}
    };
    for(let i = 0; i < n; i++) {
        obj[`frame${i}`] = {from: i, to: i}
    }
    return obj;
}

const animationLenth = {
    playerAttack: 6,
    playerIdle: 9,
    playerRun: 15,
    playerJump: 14,
}
const animationFPS = {
    playerAttack: 0.5,
    playerIdle: 0.15,
    playerRun: 0.5,
    playerJump: 0.5,
}

const mobSprOffset = {
    slime: {x: -44, y: -40},
    hornRabbit: {x: -108, y: -136},
    rabbit: {x: -108, y: -116}
}

for(let i = 0; i < 7; i++) {
    loadSprite(`playerAttack${i}`, `./src/playerAttack/playerAttack${i}.png`)
}
for(let i = 0; i < 10; i++) {
    loadSprite(`playerIdle${i}`, `./src/playerIdle/playerIdle${i}.png`)
}
for(let i = 0; i < 16; i++) {
    loadSprite(`playerRun${i}`, `./src/playerRun/playerRun${i}.png`)
}
for(let i = 0; i < 15; i++) {
    loadSprite(`playerJump${i}`, `./src/playerJump/playerJump${i}.png`)
}
// loadSprite(`playerJump0`, `./src/playerRun/playerRun5.png`);
// for(let i = 0; i < 1; i++) {
//     loadSprite(`playerRun${i}`, `./src/playerRun/playerRun${i}.png`)
// }
// loadSprite("playerAttack", "./src/ATTACK.png", {
//     sliceX: 7,
//     anims: animObj(6)
// });
// loadSprite("playerIdle", "./src/IDLE.png", {
//     sliceX: 10,
//     anims: animObj(9)
// });

loadSprite("thrust", "./src/thrust.png", {
    sliceY: 6,
    anims: {
        "run": {from: 0, to: 5}
    }
})

loadSprite("portal", "./src/portal.png", {
    sliceX: 3,
    sliceY: 2,
    anims: {
        "run": {from: 0, to: 5}
    }
})

loadSprite("grass", "./src/grass.png", {
    sliceY: 2,
    anims: {
        "bot": {from: 1, to: 1}
    }
})

loadSprite("dialBox", "./src/dialBox.png");
loadSprite("bg", "./src/bg.png");

loadSprite("slime", "./src/slimeRun.png", {
    sliceX: 4,
    anims: {
        "run": {from: 0, to: 3}
    }
})
loadSprite("rabbit", "./src/rabbitRun.png", {
    sliceX: 6,
    anims: {
        "run": {from: 0, to: 5}
    }
})
loadSprite("hornRabbit", "./src/hornRabbitAtk.png", {
    sliceX: 6,
    anims: {
        "run": {from: 0, to: 5}
    }
})

loadSprite("Kire", "./src/YOUMAKEMEUMPOCOLOCOOUMPOQUITICOLOCOOO.png");

loadSprite("placa", "./src/signPost.png");
// shaders
loadShader(
    "whiten",
    null,
    `
    uniform float qtd;

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    float t = qtd; // adjust this between 0.0 and 1.0 to control whiteness
    return mix(c, vec4(1.0, 1.0, 1.0, c.a), t);
}
`,
);
// loadBean();
// // console.log(toString(sprite("bean")));
// // try {
//     add([
//         sprite("bean"),
//         // rect(10, 10),
//         pos(100, 100)
//     ])
// // } catch (e) {
// //     console.log(e);
// // }
// add([
//     rect(100, 100),
//     pos(0, 0),
// ])

async function enterScene() {
    let r = add([
        rect(800, 600),
        pos(0, 0),
        color(BLACK),
        fixed(),
        opacity(1.0),
        z(98)
    ])
    for(let i = 1; i <= 20; i++) {
        r.use(opacity(1-i/20));
        await wait(0.05);
    }
}

async function exitScene(playerObj, portal) {
    if(playerObj) playerObj.sprObj.use(z(99));
    if(portal) portal.use(z(99));
    let r = add([
        rect(800, 600),
        pos(0, 0),
        color(BLACK),
        fixed(),
        opacity(0),
        z(98)
    ])
    for(let i = 1; i <= 20; i++) {
        r.use(opacity(i/20));
        await wait(0.05);
    }
}