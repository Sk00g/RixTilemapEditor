import * as PIXI from "pixi.js";

// Class used for displaying tilemap
class TileMap {
    constructor(stage, tilesetPath, mapSize, tileIndices = null, scale = 2.0) {
        this._tilesetPath = tilesetPath;
        this._mapSize = mapSize;
        this._tileSize = [16, 16];
        this._scale = scale;

        this._tileIndices = [];
        this._tileSprites = [];
        this._spriteContainer = new PIXI.Container();

        for (let x = 0; x < mapSize[0]; x++) {
            this._tileIndices[x] = [];
            this._tileSprites[x] = [];
            for (let y = 0; y < mapSize[1]; y++) {
                let texture = new PIXI.Texture(PIXI.BaseTexture.from(tilesetPath));
                texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                let sprite = new PIXI.Sprite(texture);

                sprite.position.set(
                    x * this._tileSize[0] * this._scale,
                    y * this._tileSize[1] * this._scale
                );
                sprite.scale.set(this._scale, this._scale);

                this._tileSprites[x][y] = sprite;

                if (!tileIndices) this.updateTileIndex(x, y, Math.floor(Math.random() * 3), 0);
                else {
                    let dataIndex = tileIndices[x][y];
                    this.updateTileIndex(x, y, dataIndex[0], dataIndex[1]);
                }

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

    clearTileTints() {
        for (let x = 0; x < this._mapSize[0]; x++) {
            for (let y = 0; y < this._mapSize[1]; y++) {
                this._tileSprites[x][y].tint = 0xffffff;
            }
        }
    }

    setTileTint(x, y, tint) {
        let tile = this._tileSprites[x][y];
        tile.tint = tint;
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

    getTileIndices() {
        return this._tileIndices;
    }
}

export default TileMap;
