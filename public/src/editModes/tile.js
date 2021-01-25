import * as PIXI from "pixi.js";
import * as utils from "../utils.js";
import assetLoader from "../assetLoader.js";
import assetMap from "../assetMap.js";
import SUIE from "../suie/suie.js";
import theme from "../tileMapThemes.json";

// CONSTANTS
const TILE_HOTKEYS = [
    "Q",
    "W",
    "E",
    "R",
    "T",
    "Y",
    "A",
    "S",
    "D",
    "F",
    "G",
    "Z",
    "X",
    "C",
    "V",
    "B",
    "P",
];

export default class TileEditMode {
    constructor(stage, tilemap, mapData) {
        this._stage = stage;
        this._tilemap = tilemap;
        this._mapData = mapData;

        this.container = new PIXI.Container();
        this.container.visible = false;

        this.themeLabel = new SUIE.Label(
            "SELECTED THEME: " + Object.keys(theme)[0],
            [1100, 30],
            10
        );
        this.container.addChild(this.themeLabel);

        this.refIconContainer = new PIXI.Container();
        this.refLabelContainer = new PIXI.Container();
        this.container.addChild(this.refIconContainer);
        this.container.addChild(this.refLabelContainer);

        this.shadowIndex = [0, 0];
        this.selectedTheme = "Grass";

        this._helpTextContainer = new PIXI.Container();
        this.container.addChild(this._helpTextContainer);
        this._updateHelpText();

        this.handleNumberPress(1);

        stage.addChild(this.container);
    }

    _updateHelpText() {
        let x = 1100;
        let y = 760;
        let pad = 15;

        for (let i = 0; i < theme.length; i++) {
            this._helpTextContainer.addChild(
                new SUIE.Label(
                    `SELECT ${theme[i].theme} - [${i + 1}]`,
                    [x, y + pad * i],
                    8,
                    0xdddddd
                )
            );
        }
    }

    activate() {
        this._tilemap.clearTileTints();
        this.container.visible = true;
    }

    deactivate() {
        this.container.visible = false;
    }

    handleNumberPress(num) {
        if (num > theme.length || num < 1) return;

        this.refIconContainer.removeChildren();
        this.refLabelContainer.removeChildren();
        this.selectedTheme = theme[num - 1].theme;

        this.themeLabel.text = `SELECTED THEME: ${this.selectedTheme}`;
        let count = 0;
        let x = 1100;
        let y = 50;
        let column = 0;
        for (let index of theme[num - 1].tiles) {
            let sprite = new PIXI.Sprite(
                assetLoader.loadTexture(assetMap.environment.tileset_grass)
            );
            sprite.texture.frame = new PIXI.Rectangle(index[0] * 16, index[1] * 16, 16, 16);
            sprite.scale.set(2, 2);
            sprite.position.set(x + column * 78, y);
            y += 36;
            this.refIconContainer.addChild(sprite);

            let label = new SUIE.Label(
                TILE_HOTKEYS[Math.min(TILE_HOTKEYS.length - 1, count++)],
                [x + 40 + column * 78, y - 26],
                10
            );
            this.refLabelContainer.addChild(label);

            if (count > 12 * (column + 1)) {
                y = 50;
                column++;
            }
        }
    }

    handleLetterPress(letter) {
        let keyIndex = TILE_HOTKEYS.indexOf(letter);
        if (keyIndex === -1) return;

        let frameRect = this.refIconContainer.getChildAt(keyIndex).texture.frame;
        this._tilemap.updateTileIndex(
            this.shadowIndex[0],
            this.shadowIndex[1],
            frameRect.x / 16,
            frameRect.y / 16
        );
    }

    updateShadow(x, y) {
        this.shadowIndex = [x, y];
        this._tilemap.moveTileShadow(x, y);
    }

    handleKeypress(code, ctrl, shift) {
        let factor = 1;
        if (shift) factor = 5;
        if (ctrl) factor = 10;

        if (code === "KeyE" && ctrl && shift) {
            this._tilemap.exportData();
        } else if (code === "ArrowLeft") {
            let x = this.shadowIndex[0] - factor;
            if (x < 0) x = this._mapData.tileMapSize[0] - 1;
            this.updateShadow(x, this.shadowIndex[1]);
        } else if (code === "ArrowRight") {
            let x = this.shadowIndex[0] + factor;
            if (x >= this._mapData.tileMapSize[0]) x = 0;
            this.updateShadow(x, this.shadowIndex[1]);
        } else if (code === "ArrowUp") {
            let y = this.shadowIndex[1] - factor;
            if (y < 0) y = this._mapData.tileMapSize[1] - 1;
            this.updateShadow(this.shadowIndex[0], y);
        } else if (code === "ArrowDown") {
            let y = this.shadowIndex[1] + factor;
            if (y >= this._mapData.tileMapSize[1]) y = 0;
            this.updateShadow(this.shadowIndex[0], y);
        } else if (utils.NUMBER_CODES.includes(code)) {
            this.handleNumberPress(parseInt(code.replace("Digit", "").replace("Numpad", "")));
        } else if (
            (code.includes("Key") && code.substr(3, 1).charCodeAt(0) <= 90) ||
            code.substr(3, 1).charCodeAt(0) >= 65
        ) {
            this.handleLetterPress(code.substr(3, 1));
        }
    }
}
