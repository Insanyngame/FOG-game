function summonEnemy(enemy, p) {
    if(enemy == "slime") {
        return addColliding({
            width: 40, height: 40,
            x: p.x, y: p.y,
            tags: ["attackable", "enemy", "slime"],
            opacity: DebugOpacity,
            otherProperties: {
                sprOffset: mobSprOffset.slime,
                face: 0,
                mass: 5,
                sprObj: add([
                    sprite("slime"),
                    pos(p.x, p.y),
                    scale(2),
                    z(6),
                    {
                        spr: "slime",
                        animSpd: 6,
                    },
                ]),
                health: 3,
                velX: 0,
                velY: 0,
                moveVelX: 2,
                atkCd: 0,
                aimingCd: 0,
                inAtk: false
            }
        })
    }
    if(enemy == "rabbit") {
        return addColliding({
            width: 40, height: 26,
            x: p.x, y: p.y,
            tags: ["attackable", "enemy", "rabbit", "slowedGravity"],
            opacity: DebugOpacity,
            otherProperties: {
                sprOffset: mobSprOffset.rabbit,
                face: 0,
                mass: 1,
                sprObj: add([
                    sprite("rabbit"),
                    pos(p.x, p.y),
                    scale(2),
                    z(6),
                    {
                        spr: "rabbit",
                        animSpd: 6,
                    },
                ]),
                health: 2,
                velX: 0,
                velY: 0,
                moveVelX: 2,
                atkCd: 0,
                aimingCd: 0,
                inAtk: false
            }
        })
    }
    if(enemy == "hornRabbit") {
        return addColliding({
            width: 40, height: 26,
            x: p.x, y: p.y,
            tags: ["attackable", "enemy", "hornRabbit"],
            opacity: DebugOpacity,
            otherProperties: {
                sprOffset: mobSprOffset.hornRabbit,
                face: 0,
                mass: 1,
                sprObj: add([
                    sprite("hornRabbit"),
                    pos(p.x, p.y),
                    scale(2),
                    z(6),
                    {
                        spr: "hornRabbit",
                        animSpd: 6,
                    },
                ]),
                health: 2,
                velX: 0,
                velY: 0,
                moveVelX: 2,
                atkCd: 0,
                aimingCd: 0,
                inAtk: false
            }
        })
    }
}

let asciiMaps = {
    1: [
        "                                                         ",
        "                           ,                             ",
        "                           .     s                       ",
        "                       ,   .     ,        ,              ",
        "                       .   .     .        .              ",
        " s      s ,!      f, s . s .     .@      @.  s         f ",
        " ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,  ,,,,,,,,,,,,,  ,  ,  ,, ",
        "      .                                                  ",
        "      .                                                  ",
        "                                                         "
    ]
}
let placasContent = {
    1: [
        "Um pouco caótico?\nTome cuidado!",
        "Use as setas para mover e Z para pular.\n\nBom jogo!",
        "Tem um slime na frente!\nAperte X para atacar.",
        "Wall jump?\nSe você atacar alguma coisa você ganha\num segundo pulo! (Isso pode acontecer\nmais de uma vez no ar)",
        "Dica: Se você segurar a seta para cima,\nvocê cai mais lento.",
        "Entre no portal para ganhar."
    ]
}
function load_ascii(level) {
    bgSprite = add([
        sprite("bg"),
        pos(0, 0),
        fixed(),
        scale(3)
    ])
    let contPlaca = 0;
    let mapa = asciiMaps[level];
    for(let i = 0; i < mapa.length; i++) {
        let startCovering = -1;
        for(let j = 0; j < mapa[i].length; j++) {
            if(mapa[i][j] == '!') {
                summonEnemy("slime", {x: j*TileSize, y: i*TileSize}).sprObj.play("run", {loop: true, speed: 6});
            }
            if(mapa[i][j] == '@') {
                summonEnemy("rabbit", {x: j*TileSize, y: i*TileSize}).sprObj.play("run", {loop: true, speed: 6});
            }
            if(mapa[i][j] == '#') {
                summonEnemy("hornRabbit", {x: j*TileSize, y: i*TileSize}).sprObj.play("run", {loop: true, speed: 12});
            }
            if(mapa[i][j] == '.' || mapa[i][j] == ',') {
                if(startCovering == -1) startCovering = j;
                if(mapa[i][j+1] != '.' && mapa[i][j+1] != ',') {
                    addColliding({
                        opacity: DebugOpacity,
                        x: startCovering*TileSize, y: i*TileSize,
                        width: (j-startCovering+1)*TileSize, height: TileSize,
                        tags: ["solid", "attackable", "wall"],
                        z: 2,
                        otherProperties: {
                            mass: -1,
                        }
                    })
                    startCovering = -1;
                }

                let g = add([
                    sprite("grass"),
                    scale(4),
                    pos(j*TileSize, i*TileSize),
                    z(0.9),
                ])
                if(mapa[i][j] == '.') {
                    g.play("bot");
                }
            }
            if(mapa[i][j] == 's') {
                add([
                    sprite("placa"),
                    pos(j*TileSize, i*TileSize)
                ])
                addColliding({
                    opacity: DebugOpacity,
                    x: j*TileSize, y: i*TileSize,
                    width: TileSize, height: TileSize,
                    tags: ["placa"],
                    z: 2,
                    otherProperties: {
                        txt: placasContent[level][contPlaca++]
                    }
                })
            }

            if(mapa[i][j] == 'f') {
                let p = add([
                    sprite("portal"),
                    scale(4),
                    pos((j-0.55)*TileSize, (i-1)*TileSize)
                ]);
                p.play("run", {loop: true, speed: 6});

                addColliding({
                    opacity: DebugOpacity,
                    x: j*TileSize, y: (i-1)*TileSize,
                    width: TileSize, height: 2*TileSize,
                    tags: ["portal"],
                    z: 2,
                    otherProperties: {
                        spritee: p,
                    }
                })
            }
        }
    }
    console.log(asciiMaps[level]);
}