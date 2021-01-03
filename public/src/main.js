import * as PIXI from "pixi.js";
import { logService, LogLevel } from "./logService.js";
import assetLoader from "./assetLoader.js";
import Keyboard from "pixi.js-keyboard";
import Mouse from "pixi.js-mouse";
import TileMap from "./tilemap.js";
import assetMap from "./assetMap.js";

PIXI.utils.sayHello("WebGL");

let app = new PIXI.Application({ width: 1400, height: 900, backgroundColor: 0x000000 });
document.body.appendChild(app.view);

assetLoader.initialize(PIXI.Loader.shared, () => {
    logService(LogLevel.INFO, "initializing application");

    let map = new TileMap(app.stage, assetMap.environment.tileset_grass, [20, 20]);

    map.moveTileShadow(4, 4);

    app.ticker.add((delta) => {
        Keyboard.update();
        Mouse.update();
    });
});
