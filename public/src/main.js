import * as PIXI from "pixi.js";
import SUIE from "./suie/suie.js";
import { logService, LogLevel } from "./logService.js";
import assetLoader from "./assetLoader.js";
import Keyboard from "pixi.js-keyboard";
import Mouse from "pixi.js-mouse";
import TileMap from "./tilemap.js";
import assetMap from "./assetMap.js";
import theme from "./tileMapThemes.json";

// TEST ONLY IMPORT
import testMapData from "../dist/maps/testMap.json";

const MAP_SIZE = [20, 20];
let NUMBER_CODES = [];
for (let key of ["Digit", "Numpad"]) {
    for (let i = 0; i < 10; i++) NUMBER_CODES.push(`${key}${i}`);
}

PIXI.utils.sayHello("WebGL");

let app = new PIXI.Application({ width: 1400, height: 900, backgroundColor: 0x000000 });
document.body.appendChild(app.view);

let shadowIndex = [0, 0];
let selectedTheme = "Grass";
let tilemap = null;

// SUIE STUFF
let themeLabel = new SUIE.Label("SELECTED THEME: " + Object.keys(theme)[0], [1100, 20], 10);
app.stage.addChild(themeLabel);

let refIconContainer = new PIXI.Container();
let refLabelContainer = new PIXI.Container();
app.stage.addChild(refIconContainer);
app.stage.addChild(refLabelContainer);
// ----------

function updateShadow(x, y) {
    shadowIndex = [x, y];
    tilemap.moveTileShadow(x, y);
}

function handleLetterPress(letter) {
    let ascii = letter.charCodeAt(0);
    if (ascii < 65 || ascii > 90) return;

    let frameRect = refIconContainer.getChildAt(ascii - 65).texture.frame;
    tilemap.updateTileIndex(shadowIndex[0], shadowIndex[1], frameRect.x / 16, frameRect.y / 16);
}

function handleNumberPress(num) {
    if (num >= theme.length) return;

    refIconContainer.removeChildren();
    refLabelContainer.removeChildren();
    selectedTheme = theme[num].theme;

    themeLabel.text = `SELECTED THEME: ${selectedTheme}`;
    let count = 0;
    let x = 1100;
    let y = 40;
    for (let index of theme[num].tiles) {
        let sprite = new PIXI.Sprite(assetLoader.loadTexture(assetMap.environment.tileset_grass));
        sprite.texture.frame = new PIXI.Rectangle(index[0] * 16, index[1] * 16, 16, 16);
        sprite.scale.set(2, 2);
        sprite.position.set(x, y);
        y += 36;
        refIconContainer.addChild(sprite);

        let label = new SUIE.Label(String.fromCharCode(65 + count++), [x + 40, y - 26], 10);
        refLabelContainer.addChild(label);
    }
}

// Application entry point
assetLoader.initialize(PIXI.Loader.shared, () => {
    logService(LogLevel.INFO, "initializing application");

    tilemap = new TileMap(
        app.stage,
        assetMap.environment.tileset_grass,
        MAP_SIZE,
        testMapData.tileIndices
    );

    // Select default theme
    handleNumberPress(0);

    Keyboard.events.on("pressed", (keyCode, event) => {
        let ctrlPressed = Keyboard.isKeyDown("ControlLeft") || Keyboard.isKeyDown("ControlRight");
        let shiftPressed = Keyboard.isKeyDown("ShiftLeft") || Keyboard.isKeyDown("ShiftRight");

        let factor = 1;
        if (shiftPressed) factor = 5;
        if (ctrlPressed) factor = 10;

        if (keyCode === "KeyE" && ctrlPressed && shiftPressed) {
            tilemap.exportData();
        } else if (keyCode === "ArrowLeft") {
            let x = shadowIndex[0] - factor;
            if (x < 0) x = MAP_SIZE[0] - 1;
            updateShadow(x, shadowIndex[1]);
        } else if (keyCode === "ArrowRight") {
            let x = shadowIndex[0] + factor;
            if (x >= MAP_SIZE[0]) x = 0;
            updateShadow(x, shadowIndex[1]);
        } else if (keyCode === "ArrowUp") {
            let y = shadowIndex[1] - factor;
            if (y < 0) y = MAP_SIZE[1] - 1;
            updateShadow(shadowIndex[0], y);
        } else if (keyCode === "ArrowDown") {
            let y = shadowIndex[1] + factor;
            if (y >= MAP_SIZE[1]) y = 0;
            updateShadow(shadowIndex[0], y);
        } else if (NUMBER_CODES.includes(keyCode)) {
            handleNumberPress(parseInt(keyCode.replace("Digit", "").replace("Numpad", "")));
        } else if (
            (keyCode.includes("Key") && keyCode.substr(3, 1).charCodeAt(0) <= 90) ||
            keyCode.substr(3, 1).charCodeAt(0) >= 65
        ) {
            handleLetterPress(keyCode.substr(3, 1));
        }
    });

    app.ticker.add((delta) => {
        Keyboard.update();
        Mouse.update();
    });
});
