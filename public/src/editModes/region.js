import * as PIXI from "pixi.js";
import { logService, LogLevel } from "../logService";
import SUIE from "../suie/suie";

export default class RegionEditMode {
    constructor(stage, tilemap, mapData, regions) {
        this._stage = stage;
        this._tilemap = tilemap;
        this._mapData = mapData;
        this._regions = regions;

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
        this._selectedRegionIndex = 0;
        this._regionLabelContainer = new PIXI.Container();
        this.container.addChild(this._regionLabelContainer);

        this._helpTextContainer = new PIXI.Container();
        this.container.addChild(this._helpTextContainer);

        this._updateRegionLabels();
        this._updateRegionTinting();
        this._updateHelpText();

        stage.addChild(this.container);
    }

    _updateHelpText() {
        let x = 1100;
        let y = 760;
        let pad = 15;

        this._helpTextContainer.addChild(new SUIE.Label("New Region - [N]", [x, y], 8, 0xdddddd));
        this._helpTextContainer.addChild(
            new SUIE.Label("Delete Region - [D]", [x, y + pad * 1], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Cycle Selected Region - [\\]", [x, y + pad * 2], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Add Border Tile - [B]", [x, y + pad * 3], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Remove Border Tile - [R]", [x, y + pad * 4], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Update Center Tile - [C]", [x, y + pad * 5], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Add Border Region - [A]", [x, y + pad * 6], 8, 0xdddddd)
        );
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
            this._tilemap.setTileTint(
                (region.unitPoint[0] / 16) * this._mapData.scale,
                (region.unitPoint[1] / 16) * this._mapData.scale,
                0xff0000
            );
        }
    }

    _updateRegionLabels() {
        this._regionLabelContainer.removeChildren();

        let startx = 1100;
        let y = 30;
        for (let region of this._regions) {
            let fontColor =
                this._regions.indexOf(region) === this._selectedRegionIndex ? 0xff0000 : 0xdddddd;
            let text = `${region.name} (${region.borderTiles.length})[${region.borderRegions.length}]`;
            let label = new SUIE.Label(text, [startx, y], 8, fontColor);
            y += 20;
            this._regionLabelContainer.addChild(label);

            label = new SUIE.Label(text, region.unitPoint, 8, fontColor);
            this._regionLabelContainer.addChild(label);
        }
    }

    _createNewRegion() {
        logService(
            LogLevel.INFO,
            `Created new region: REGION_${this._regions.length}`,
            "REGION_MODE"
        );

        // Get the highest available region number
        let highest = 0;
        for (let region of this._regions.filter((r) => r.name.includes("REGION_"))) {
            let num = parseInt(region.name.substr(region.name.length - 1));
            if (num > highest) highest = num;
        }

        this._regions.push({
            name: "REGION_" + (highest + 1),
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
        } else if (code === "KeyA") {
            let region = this._regions[this._selectedRegionIndex];
            let selectedPoint = [this.shadowIndex[0] * 16, this.shadowIndex[1] * 16];
            let selectedRegion = this._regions.find(
                (r) => r.unitPoint[0] === selectedPoint[0] && r.unitPoint[1] === selectedPoint[1]
            );
            if (
                selectedRegion &&
                !region.borderRegions.find((r) => selectedRegion.name === r.name)
            ) {
                region.borderRegions.push(selectedRegion.name);
            }
            this._updateRegionLabels();
        } else if (code === "KeyL") {
            console.log(this._regions);
        } else if (code === "KeyD") {
            let region = this._regions[this._selectedRegionIndex];
            this._selectedRegionIndex = 0;
            logService(LogLevel.WARNING, `Deleted region ${region.name}`, "REGION_MODE");
            this._regions.splice(this._regions.indexOf(region), 1);
            this._updateRegionTinting();
            this._updateRegionLabels();
        } else if (code === "KeyR") {
            let region = this._regions[this._selectedRegionIndex];
            let match = region.borderTiles.find(
                (coords) => coords[0] === this.shadowIndex[0] && coords[1] === this.shadowIndex[1]
            );
            if (match) region.borderTiles.splice(region.borderTiles.indexOf(match), 1);
            this._updateRegionTinting();
            this._updateRegionLabels();
        } else if (code === "Backslash") {
            this._selectedRegionIndex++;
            if (this._selectedRegionIndex >= this._regions.length) this._selectedRegionIndex = 0;
            this._updateRegionLabels();
        } else if (code === "KeyB") {
            let region = this._regions[this._selectedRegionIndex];
            if (
                !region.borderTiles.find(
                    (coords) =>
                        coords[0] === this.shadowIndex[0] && coords[1] === this.shadowIndex[1]
                )
            ) {
                region.borderTiles.push(this.shadowIndex);
                this._updateRegionTinting();
                this._updateRegionLabels();
            }
        } else if (code === "KeyC") {
            this._regions[this._selectedRegionIndex].unitPoint = [
                this.shadowIndex[0] * 16 * this.mapData.scale,
                this.shadowIndex[1] * 16 * this.mapData.scale,
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
