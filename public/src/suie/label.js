import * as PIXI from "pixi.js";

class Label extends PIXI.Text {
    constructor(text, position, fontSize = 6, fontColor = "#dddddd") {
        super(text, { fontFamily: "emulogic", fontSize: fontSize, fill: fontColor });

        this.position.set(...position);
    }
}

export default Label;
