import * as PIXI from "pixi.js";
import { logService, LogLevel } from "../logService";
import SUIE from "../suie/suie";

// CONSTANTS
const COLORS = ["#FF4030", "#40FF30", "#4030FF", "#DDDD30", "#DD30DD", "#30DDDD"];

export default class ContinentEditMode {
    constructor(stage, tilemap, mapData, regions, continents) {
        this._stage = stage;
        this._tilemap = tilemap;
        this._mapData = mapData;
        this._regions = regions;
        this._continents = continents;

        this.container = new PIXI.Container();
        this.container.visible = false;

        this._selectedContinentIndex = 0;
        this._selectedRegionIndex = 0;

        this._regionLabelContainer = new PIXI.Container();
        this._continentLabelContainer = new PIXI.Container();
        this._helpTextContainer = new PIXI.Container();

        this.container.addChild(this._helpTextContainer);
        this.container.addChild(this._regionLabelContainer);
        this.container.addChild(this._continentLabelContainer);

        this._updateHelpText();

        stage.addChild(this.container);
    }

    _updateHelpText() {
        let x = 1100;
        let y = 760;
        let pad = 15;

        this._helpTextContainer.addChild(
            new SUIE.Label("New Continent - [N]", [x, y], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Delete Continent - [D]", [x, y + pad * 1], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Cycle Selected Region - [\\]", [x, y + pad * 2], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Cycle Selected Continent - [/]", [x, y + pad * 3], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Add Region to Continent - [A]", [x, y + pad * 4], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Remove Region from Continent - [R]", [x, y + pad * 5], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Increase Ownership Value - [+]", [x, y + pad * 6], 8, 0xdddddd)
        );
        this._helpTextContainer.addChild(
            new SUIE.Label("Decrease Ownership Value - [-]", [x, y + pad * 7], 8, 0xdddddd)
        );
    }

    _drawRegionTinting() {
        console.log("drawing region tints");
        this._tilemap.clearTileTints();
        for (let i = 0; i < this._regions.length; i++) {
            let region = this._regions[i];
            let regionTint = 0xff - i * 30;
            regionTint = regionTint + (0xdd << 8) + (regionTint << 16);
            for (let coords of region.borderTiles) {
                this._tilemap.setTileTint(coords[0], coords[1], regionTint);
            }
            this._tilemap.setTileTint(
                region.unitPoint[0] / (16 * this._mapData.scale),
                region.unitPoint[1] / (16 * this._mapData.scale),
                0xff0000
            );
        }
    }

    _updateContinentLabels() {
        this._continentLabelContainer.removeChildren();

        let startx = 1100;
        let y = 40;
        for (let cont of this._continents) {
            let text = `${cont.name} (${cont.regions.length})[${cont.ownershipValue}]`;
            if (this._continents.indexOf(cont) === this._selectedContinentIndex) text += " ***";
            let label = new SUIE.Label(text, [startx, y], 8, cont.color);
            y += 15;
            this._continentLabelContainer.addChild(label);
        }
    }

    _updateRegionLabels() {
        this._regionLabelContainer.removeChildren();

        let startx = 1100;
        let y = 300;
        for (let region of this._regions) {
            let cont = this._continents[this._selectedContinentIndex];
            let fontColor = 0xdddddd;
            if (cont.regions.includes(region.name)) fontColor = 0x3040ff;

            let text = `${region.name} (${region.borderTiles.length})[${region.borderRegions.length}]`;
            if (region === this._regions[this._selectedRegionIndex]) text += " ***";

            let label = new SUIE.Label(text, [startx, y], 8, fontColor);
            y += 20;
            this._regionLabelContainer.addChild(label);

            label = new SUIE.Label(text, region.unitPoint, 10, fontColor);
            let shadowLabel = new SUIE.Label(
                text,
                [region.unitPoint[0] + 1, region.unitPoint[1] + 1],
                10,
                0x000000
            );
            this._regionLabelContainer.addChild(shadowLabel);
            this._regionLabelContainer.addChild(label);
        }
    }

    _createNewContinent() {
        // Get the highest available region number
        let highest = 0;
        for (let cont of this._continents.filter((c) => c.name.includes("CONTINENT_"))) {
            let num = parseInt(cont.name.substr(cont.name.length - 1));
            if (num > highest) highest = num;
        }

        logService(
            LogLevel.INFO,
            `Created new continent: CONTINENT_${highest + 1}`,
            "CONTINENT_MODE"
        );

        this._continents.push({
            name: "CONTINENT_" + (highest + 1),
            regions: [],
            color: COLORS[highest % COLORS.length],
            ownershipValue: 1,
        });
        this._updateContinentLabels();
    }

    _deleteContinent(cont) {
        this._selectedContinentIndex = 0;
        this._continents.splice(this._continents.indexOf(cont), 1);
        logService(LogLevel.WARNING, `Deleting continent ${cont.name}`, "CONTINENT_MODE");
        this._updateContinentLabels();
    }

    activate() {
        this.container.visible = true;

        this._updateRegionLabels();
        this._updateContinentLabels();

        // Draw once only as it can't be edited in this state
        this._drawRegionTinting();
    }

    deactivate() {
        this.container.visible = false;

        this._tilemap.clearTileTints();
    }

    _removeRegionFromContinent(region, cont) {
        if (cont.regions.includes(region.name)) {
            cont.regions.splice(cont.regions.indexOf(region.name), 1);
            this._updateRegionLabels();
            this._updateContinentLabels();
        }
    }

    handleKeypress(code, ctrl, shift) {
        if (code === "KeyN") {
            this._createNewContinent();
        } else if (code === "KeyD") {
            let cont = this._continents[this._selectedContinentIndex];
            this._deleteContinent(cont);
        } else if (code === "Backslash") {
            this._selectedRegionIndex++;
            if (this._selectedRegionIndex >= this._regions.length) this._selectedRegionIndex = 0;
            this._updateRegionLabels();
        } else if (code === "Slash") {
            this._selectedContinentIndex++;
            if (this._selectedContinentIndex >= this._continents.length)
                this._selectedContinentIndex = 0;
            this._updateRegionLabels();
            this._updateContinentLabels();
        } else if (code === "KeyA") {
            let cont = this._continents[this._selectedContinentIndex];
            let region = this._regions[this._selectedRegionIndex];

            for (let c of this._continents) {
                if (c.regions.includes(region.name)) this._removeRegionFromContinent(region, c);
            }

            cont.regions.push(region.name);

            this._updateRegionLabels();
            this._updateContinentLabels();
        } else if (code === "KeyR") {
            let cont = this._continents[this._selectedContinentIndex];
            let region = this._regions[this._selectedRegionIndex];
            this._removeRegionFromContinent(region, cont);
        } else if (code === "NumpadAdd") {
            let cont = this._continents[this._selectedContinentIndex];
            cont.ownershipValue++;
            this._updateContinentLabels();
        } else if (code === "NumpadSubtract") {
            let cont = this._continents[this._selectedContinentIndex];
            cont.ownershipValue--;
            if (cont.ownershipValue < 0) cont.ownershipValue = 0;
            this._updateContinentLabels();
        }
    }
}
