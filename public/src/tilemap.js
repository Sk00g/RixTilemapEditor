import * as PIXI from "pixi.js";

// Class used for displaying tilemap
class TileMap {
    constructor(stage, tilesetPath, mapSize) {
        this._tileSize = [16, 16];
        this._scale = 2.0;

        this._tileIndices = [];
        this._tileSprites = [];
        this._spriteContainer = new PIXI.Container();

        for (let x = 0; x < mapSize[0]; x++) {
            this._tileIndices[x] = [];
            this._tileSprites[x] = [];
            for (let y = 0; y < mapSize[1]; y++) {
                let texture = new PIXI.Texture(PIXI.BaseTexture.from(tilesetPath));
                let sprite = new PIXI.Sprite(texture);

                sprite.position.set(
                    x * this._tileSize[0] * this._scale,
                    y * this._tileSize[1] * this._scale
                );
                sprite.scale.set(this._scale, this._scale);

                this._tileSprites[x][y] = sprite;

                this.updateTileIndex(x, y, Math.floor(Math.random() * 3), 0);

                this._spriteContainer.addChild(sprite);
            }
        }

        this._shadow = new PIXI.Graphics();
        this._shadow.beginFill(0x000000, 0.3);
        this._shadow.drawRect(
            0,
            0,
            this._tileSize[0] * this._scale,
            this._tileSize[1] * this._scale
        );
        this._shadow.endFill();
        this._spriteContainer.addChild(this._shadow);

        stage.addChild(this._spriteContainer);
    }

    moveTileShadow(x, y) {
        let tile = this._tileSprites[x][y];
        this._shadow.position = tile.position;
    }

    updateTileIndex(tileX, tileY, indexX, indexY) {
        this._tileIndices[tileX][tileY] = [indexX, indexY];
        this._tileSprites[tileX][tileY].texture.frame = new PIXI.Rectangle(
            indexX * this._tileSize[0],
            indexY * this._tileSize[1],
            this._tileSize[0],
            this._tileSize[1]
        );
    }

    exportToDataFile(fileName) {
        // collect all internal variables into a single data object
        // convert said object into text (let text = JSON.stringify(data))
        // download said text to the browser-user's computer
    }
}

export default TileMap;
