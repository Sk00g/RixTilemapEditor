import * as PIXI from "pixi.js";
import SUIE from "./suie/suie.js";
import { logService, LogLevel } from "./logService.js";
import assetLoader from "./assetLoader.js";
import Keyboard from "pixi.js-keyboard";
import Mouse from "pixi.js-mouse";
import TileMap from "./tilemap.js";
import assetMap from "./assetMap.js";
import exportData from "./exporter.js";
import TileEditMode from "./editModes/tile.js";
import RegionEditMode from "./editModes/region.js";
import ContinentEditMode from "./editModes/continent.js";

// TEST ONLY IMPORT
import testMapData from "../dist/maps/Protomap.json";
const EDIT_MODES = ["TILE", "REGION", "CONTINENT"];
let currentMode = 0;

PIXI.utils.sayHello("WebGL");

let app = new PIXI.Application({ width: 1400, height: 900, backgroundColor: 0x000000 });
document.body.appendChild(app.view);

let tilemap = null;
let modes = {};
let modeLabel = null;

function getActiveMode() {
    return modes[EDIT_MODES[currentMode]];
}

// Application entry point
assetLoader.initialize(PIXI.Loader.shared, () => {
    logService(LogLevel.INFO, "initializing application");

    tilemap = new TileMap(
        app.stage,
        assetMap.environment.tileset_grass,
        testMapData.tileMapSize,
        testMapData.tileIndices,
        testMapData.scale
    );

    // Generate edit mode classes
    modes = {
        TILE: new TileEditMode(app.stage, tilemap, testMapData),
        REGION: new RegionEditMode(app.stage, tilemap, testMapData),
        CONTINENT: new ContinentEditMode(app.stage, tilemap, testMapData),
    };
    modeLabel = new SUIE.Label(`MODE: ${EDIT_MODES[currentMode]}`, [1100, 10], 10);
    app.stage.addChild(modeLabel);

    // Start off by activating initial mode
    getActiveMode().activate();

    Keyboard.events.on("pressed", (code) => {
        let ctrlPressed = Keyboard.isKeyDown("ControlLeft") || Keyboard.isKeyDown("ControlRight");
        let shiftPressed = Keyboard.isKeyDown("ShiftLeft") || Keyboard.isKeyDown("ShiftRight");

        console.log(code);

        // Handle mode changing
        if (code === "Backquote") {
            getActiveMode().deactivate();
            currentMode++;
            if (currentMode >= EDIT_MODES.length) currentMode = 0;
            modeLabel.text = `MODE: ${EDIT_MODES[currentMode]}`;
            getActiveMode().activate();
            return;
        }

        // Ctrl + Shift + E for exporting current map data
        if (code === "KeyE" && ctrlPressed && shiftPressed) {
            exportData(testMapData, tilemap, modes.REGION.getRegions());
            return;
        }

        getActiveMode().handleKeypress(code, ctrlPressed, shiftPressed);
    });

    app.ticker.add((delta) => {
        Keyboard.update();
        Mouse.update();
    });
});
