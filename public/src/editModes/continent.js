import * as PIXI from "pixi.js";

export default class ContinentEditMode {
    constructor(stage) {
        this.container = new PIXI.Container();
        // let themeLabel = new SUIE.Label("SELECTED THEME: " + Object.keys(theme)[0], [1100, 20], 10);
        // hudContainers.TILE.addChild(themeLabel);
        // let refIconContainer = new PIXI.Container();
        // let refLabelContainer = new PIXI.Container();
        // hudContainers.TILE.addChild(refIconContainer);
        // hudContainers.TILE.addChild(refLabelContainer);

        this.container.visible = false;
    }

    activate() {
        this.container.visible = true;
    }

    deactivate() {
        this.container.visible = false;
    }

    handleKeypress(code, ctrl, shift) {}
}
