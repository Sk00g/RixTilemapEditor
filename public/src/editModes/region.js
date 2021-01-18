import * as PIXI from "pixi.js";
import { logService, LogLevel } from "../logService";
import SUIE from "../suie/suie";

export default class RegionEditMode {
    constructor(stage, tilemap, mapData) {
        this._stage = stage;
        this._tilemap = tilemap;
        this._mapData = mapData;

        this.container = new PIXI.Container();
        this.container.visible = false;
        this.shadowIndex = [0, 0];

        /*
        {
            "name": "SJ-1",
            "borderTiles": [
                [2, 2],
                [3, 2],
                ...
            ],
            "unitPoint": [124, 124],
            "borderRegions": ["SEJ-1", "SJ-2"]
        } 
        */
        this._regions = [...mapData.regions];
        this._selectedRegionIndex = 0;
        this._regionLabelContainer = new PIXI.Container();
        this.container.addChild(this._regionLabelContainer);

        this._updateRegionLabels();
        this._updateRegionTinting();

        stage.addChild(this.container);
    }

    _updateRegionTinting() {
        this._tilemap.clearTileTints();
        for (let i = 0; i < this._regions.length; i++) {
            let region = this._regions[i];
            let regionTint = 0xff - i * 30;
            regionTint = regionTint + (0xdd << 8) + (regionTint << 16);
            for (let coords of region.borderTiles) {
                this._tilemap.setTileTint(coords[0], coords[1], regionTint);
            }
            this._tilemap.setTileTint(region.unitPoint[0] / 16, region.unitPoint[1] / 16, 0xff0000);
        }
    }

    _updateRegionLabels() {
        this._regionLabelContainer.removeChildren();

        let startx = 1100;
        let y = 80;
        for (let region of this._regions) {
            let fontColor =
                this._regions.indexOf(region) === this._selectedRegionIndex ? 0xff0000 : 0xdddddd;
            let label = new SUIE.Label(
                `${region.name} (${region.borderTiles.length})`,
                [startx, y],
                10,
                fontColor
            );
            y += 20;
            this._regionLabelContainer.addChild(label);
        }
    }

    _createNewRegion() {
        logService(
            LogLevel.INFO,
            `Created new region: REGION_${this._regions.length}`,
            "REGION_MODE"
        );
        this._regions.push({
            name: "REGION_" + this._regions.length,
            borderTiles: [],
            unitPoint: [0, 0],
            borderRegions: [],
        });
        this._updateRegionLabels();
    }

    _updateShadow(x, y) {
        this.shadowIndex = [x, y];
        this._tilemap.moveTileShadow(x, y);
    }

    getRegions() {
        return this._regions;
    }

    activate() {
        this.container.visible = true;

        this._updateRegionLabels();
        this._updateRegionTinting();
    }

    deactivate() {
        this.container.visible = false;

        this._tilemap.clearTileTints();
    }

    handleKeypress(code, ctrl, shift) {
        let factor = 1;
        if (shift) factor = 5;
        if (ctrl) factor = 10;

        if (code === "KeyN") {
            this._createNewRegion();
        } else if (code === "Backslash") {
            this._selectedRegionIndex++;
            if (this._selectedRegionIndex >= this._regions.length) this._selectedRegionIndex = 0;
            this._updateRegionLabels();
        } else if (code === "KeyB") {
            this._regions[this._selectedRegionIndex].borderTiles.push(this.shadowIndex);
            this._updateRegionTinting();
            this._updateRegionLabels();
        } else if (code === "KeyC") {
            this._regions[this._selectedRegionIndex].unitPoint = [
                this.shadowIndex[0] * 16,
                this.shadowIndex[1] * 16,
            ];
            this._updateRegionTinting();
        } else if (code === "ArrowLeft") {
            let x = this.shadowIndex[0] - factor;
            if (x < 0) x = this._mapData.tileMapSize[0] - 1;
            this._updateShadow(x, this.shadowIndex[1]);
        } else if (code === "ArrowRight") {
            let x = this.shadowIndex[0] + factor;
            if (x >= this._mapData.tileMapSize[0]) x = 0;
            this._updateShadow(x, this.shadowIndex[1]);
        } else if (code === "ArrowUp") {
            let y = this.shadowIndex[1] - factor;
            if (y < 0) y = this._mapData.tileMapSize[1] - 1;
            this._updateShadow(this.shadowIndex[0], y);
        } else if (code === "ArrowDown") {
            let y = this.shadowIndex[1] + factor;
            if (y >= this._mapData.tileMapSize[1]) y = 0;
            this._updateShadow(this.shadowIndex[0], y);
        }
    }
}
