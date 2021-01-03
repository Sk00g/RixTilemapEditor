import * as PIXI from "pixi.js";
import Label from "./label";
import core from "./core";
import Mouse from "pixi.js-mouse";

const BORDER_FRAMES = {
    [core.PanelColor.BLUE]: {
        l: [368, 32, 8, 16],
        m: [381, 32, 8, 16],
        r: [392, 32, 8, 16],
    },
    [core.PanelColor.ORANGE]: {
        l: [240, 32, 8, 16],
        m: [252, 32, 8, 16],
        r: [264, 32, 8, 16],
    },
};
const BORDER_WIDTH = 8;

class TextButton extends PIXI.Container {
    constructor(text, position, action, color = core.PanelColor.BLUE) {
        super();

        this._text = text;
        this._color = color;
        this._suieChildren = [];
        this._isPressed = false;
        this._length = 20 + this._text.length * 6;
        this._action = action;
        this.position.set(...position);

        this._highlight = new PIXI.Graphics();
        this._highlight.beginFill(0xffffff, 0.15);
        this._highlight.drawRect(2, 2, this._length - 4, 12);
        this._highlight.endFill();
        this._highlight.visible = false;
        this._suieChildren.push(this._highlight);

        this._label = new Label(text, [10, 4]);
        this._suieChildren.push(this._label);

        Mouse.events.on("pressed", (code, event) => this._mouseDown(code, event));
        Mouse.events.on("released", (code, event) => this._mouseUp(code, event));

        this._assemble();
    }

    _isPointWithin(x, y) {
        let thisX = this.getGlobalPosition().x;
        let thisY = this.getGlobalPosition().y;
        return x < thisX + this._length && x > thisX && y > thisY && y < thisY + 16;
    }

    _mouseDown(code, event) {
        let x = Math.floor(event.offsetX / core.RESOLUTION_SCALE);
        let y = Math.floor(event.offsetY / core.RESOLUTION_SCALE);
        if (this._isPointWithin(x, y)) {
            this._isPressed = true;
            this._highlight.visible = true;
            this._label.x += 1;
            this._label.y += 1;
        }
    }

    _mouseUp(code, event) {
        if (this._isPressed) {
            let x = Math.floor(event.offsetX / core.RESOLUTION_SCALE);
            let y = Math.floor(event.offsetY / core.RESOLUTION_SCALE);

            this._isPressed = false;
            this._highlight.visible = false;
            this._label.x -= 1;
            this._label.y -= 1;
            if (this._isPointWithin(x, y) && this._action) this._action();
        }
    }

    _getBorderSprite(border) {
        let texture = new PIXI.Texture(
            PIXI.BaseTexture.from(core.SOURCE_PATH),
            new PIXI.Rectangle(...BORDER_FRAMES[this._color][border])
        );
        let sprite = new PIXI.Sprite(texture);
        return sprite;
    }

    _assemble() {
        this.removeChildren();

        let w = this._length;

        this.addChild(this._getBorderSprite("l"));
        let right = this._getBorderSprite("r");
        right.x = w - BORDER_WIDTH;
        this.addChild(right);

        let curx = BORDER_WIDTH;
        while (curx < w - BORDER_WIDTH * 2) {
            let mid = this._getBorderSprite("m");
            mid.x = curx;
            curx += BORDER_WIDTH;
            this.addChild(mid);
        }
        let fill = this._getBorderSprite("m");
        fill.x = w - BORDER_WIDTH * 2;
        this.addChild(fill);

        if (this._suieChildren.length > 0) this.addChild(...this._suieChildren);
    }
}

export default TextButton;
