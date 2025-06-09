function keyDown(key) {
    if(key == "up") return (isKeyDown("up") || isKeyDown("w"));
    if(key == "down") return (isKeyDown("down") || isKeyDown("s"));
    if(key == "left") return (isKeyDown("left") || isKeyDown("a"));
    if(key == "right") return (isKeyDown("right") || isKeyDown("d"));
    if(key == "jump") return (isKeyDown("z"));
    if(key == "atk") return (isKeyDown("x"));
}

let wasPressed = {
    atk: false,
    up: false
}
let isPressed = {
    atk: false,
    down: false
}

function updateKeyPressed() {
    if(keyDown("atk") && !wasPressed["atk"]) isPressed["atk"] = true;
    else isPressed["atk"] = false;

    if(keyDown("down") && !wasPressed["down"]) isPressed["down"] = true;
    else isPressed["down"] = false;
    
    wasPressed["atk"] = keyDown("atk");
    wasPressed["down"] = keyDown("down");
}

function keyPressed(key) {
    if(key == "atk") return isPressed["atk"];
    if(key == "down") return isPressed["down"];
}