const screen = document.getElementById('screen');
const context = screen.getContext('2d');

const fps = 120;
const cycleDelay = Math.floor(1000 / fps);

const width = 1920;
const height = 1080;

const mapSize = 16;
const mapScale = 50;
const mapRange = mapSize * mapScale;
const mapSpeed = (mapScale / 2) / 10;

var map = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1,
    1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

var playerX = mapScale + 20;
var playerY = mapScale + 20;
var playerAngle = Math.PI / 3;
var playerMoveX = 0;
var playerMoveY = 0;
var playerMoveAngle = 0;

document.onkeydown = function (event) {
    switch (event.keyCode) {
        case 40: playerMoveX = -1; playerMoveY = -1; break;
        case 38: playerMoveX = 1; playerMoveY = 1; break;
        case 37: playerMoveAngle = -1; break;
        case 39: playerMoveAngle = 1; break;
    }
}

document.onkeyup = function (event) {
    switch (event.keyCode) {
        case 40:
        case 38: playerMoveX = 0; playerMoveY = 0; break;
        case 37:
        case 39: playerMoveAngle = 0; break;
    }
}

const doublePI = 2 * Math.PI;
const fov = Math.PI / 3;
const halfFov = fov / 2;
const stepAngle = fov / width;

function canvasLoop() {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    var playerOffsetX = Math.cos(playerAngle) * mapSpeed;
    var playerOffsetY = Math.sin(playerAngle) * mapSpeed;
    var mapTargetX = Math.floor(playerY / mapScale) * mapSize + Math.floor((playerX + playerOffsetX * playerMoveX) / mapScale);
    var mapTargetY = Math.floor((playerY + playerOffsetY * playerMoveY) / mapScale) * mapSize + Math.floor(playerX / mapScale);

    if (playerMoveX && map[mapTargetX] == 0) playerX += playerOffsetX * playerMoveX;
    if (playerMoveY && map[mapTargetY] == 0) playerY += playerOffsetY * playerMoveY;
    if (playerMoveAngle) playerAngle += 0.03 * playerMoveAngle;

    var mapOffsetX = Math.floor(width / 2 - mapRange / 2);
    var mapOffsetY = Math.floor(height / 2 - mapRange / 2);

    for (let row = 0; row < mapSize; row++) {
        for (let col = 0; col < mapSize; col++) {
            let cell = map[row * mapSize + col];
            if (cell == 1) {
                context.fillStyle = '#555';
                context.fillRect(
                    col * mapScale + mapOffsetX,
                    row * mapScale + mapOffsetY,
                    mapScale,
                    mapScale
                );
            } else {
                context.fillStyle = '#aaa';
                context.fillRect(
                    col * mapScale + mapOffsetX,
                    row * mapScale + mapOffsetY,
                    mapScale,
                    mapScale
                );
            }
        }
    }

    var playerMapX = playerX + mapOffsetX;
    var playerMapY = playerY + mapOffsetY;

    context.fillStyle = 'Red';
    context.beginPath();
    context.arc(playerMapX, playerMapY, 10, 0, doublePI);
    context.fill();
    context.strokeStyle = 'Red';
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(playerMapX, playerMapY);
    context.lineTo(playerMapX + Math.cos(playerAngle) * 30, playerMapY + Math.sin(playerAngle) * 30);
    context.stroke();

    var currentAngle = playerAngle + halfFov;
    var rayStartX = Math.floor(playerX / mapScale) * mapScale;
    var rayStartY = Math.floor(playerY / mapScale) * mapScale;

    for (var ray = 0; ray < width; ray++) {
        var currentCos = Math.cos(currentAngle); currentCos = currentCos ? currentCos : 0.000001;
        var currentSin = Math.sin(currentAngle); currentSin = currentSin ? currentSin : 0.000001;

        var rayEndX, rayEndY, rayDirectionX, verticalDepth;

        if (currentCos > 0) { rayEndX = rayStartX + mapScale; rayDirectionX = 1 }
        else { rayEndX = rayStartX; rayDirectionX = -1 }
        for (var offset = 0; offset < mapRange; offset += mapScale) {
            verticalDepth = (rayEndX - playerX) / currentCos;
            rayEndY = playerY + verticalDepth * currentSin;
            var mapTargetX = Math.floor(rayEndX / mapScale);
            var mapTargetY = Math.floor(rayEndY / mapScale);
            if (currentCos <= 0) mapTargetX += rayDirectionX;
            var targetSquare = mapTargetY * mapSize + mapTargetX;
            if (targetSquare < 0 || targetSquare > map.length - 1) break;
            if (map[targetSquare] != 0) break;
            rayEndX += rayDirectionX * mapScale;
        }

        var tempX = rayEndX; tempY = rayEndY;

        var rayEndY, rayEndX, rayDirectionY, horizontalDepth;

        var rayEndY, rayEndX, rayDirectionY, horizontalDepth;
        if (currentSin > 0) { rayEndY = rayStartY + mapScale; rayDirectionY = 1 }
        else { rayEndY = rayStartY; rayDirectionY = -1 }
        for (var offset = 0; offset < mapRange; offset += mapScale) {
            horizontalDepth = (rayEndY - playerY) / currentSin;
            rayEndX = playerX + horizontalDepth * currentCos;
            var mapTargetX = Math.floor(rayEndX / mapScale);
            var mapTargetY = Math.floor(rayEndY / mapScale);
            if (currentSin <= 0) mapTargetY += rayDirectionY;
            var targetSquare = mapTargetY * mapSize + mapTargetX;
            if (targetSquare < 0 || targetSquare > map.length - 1) break;
            if (map[targetSquare] != 0) break;
            rayEndY += rayDirectionY * mapScale;
        }
        var endX = verticalDepth < horizontalDepth ? tempX : rayEndX;
        var endY = verticalDepth < horizontalDepth ? tempY : rayEndY;

        context.strokeStyle = 'Yellow';
        context.lineWidht = 1;
        context.beginPath();
        context.moveTo(playerMapX, playerMapY);
        context.lineTo(endX + mapOffsetX, endY + mapOffsetY);
        context.stroke();

        currentAngle -= stepAngle;
}



setTimeout(canvasLoop, cycleDelay);
}

window.onload = (event) => { canvasLoop() };