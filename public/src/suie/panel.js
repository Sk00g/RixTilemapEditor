import * as PIXI from "pixi.js";
import core from "./core";

const BORDER_FRAMES = {
    [core.PanelSize.LARGE]: {
        [core.PanelColor.BLUE]: {
            tl: [384, 96, 16, 16],
            t: [407, 96, 16, 16],
            tr: [432, 96, 16, 16],
            r: [432, 121, 16, 16],
            br: [432, 160, 16, 16],
            b: [407, 160, 16, 16],
            bl: [384, 160, 16, 16],
            l: [384, 121, 16, 16],
        },
        [core.PanelColor.ORANGE]: {
            tl: [320, 96, 16, 16],
            t: [339, 96, 16, 16],
            tr: [368, 96, 16, 16],
            r: [368, 136, 16, 16],
            br: [368, 160, 16, 16],
            b: [353, 160, 16, 16],
            bl: [320, 160, 16, 16],
            l: [320, 127, 16, 16],
        },
    },
    [core.PanelSize.SMALL]: {
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
    },
};
const BACKGROUND_COLOR = {
    [core.PanelColor.BLUE]: 0x417291,
    [core.PanelColor.ORANGE]: 0xd36b41,
};
const RAW_BORDER_WIDTH = {
    [core.PanelSize.LARGE]: 16,
    [core.PanelSize.SMALL]: 8,
};
const RAW_BORDER_HEIGHT = {
    [core.PanelSize.LARGE]: 16,
    [core.PanelSize.SMALL]: 8,
};

class Panel extends PIXI.Container {
    constructor(rect, panelSize = core.PanelSize.LARGE, panelColor = core.PanelColor.BLUE) {
        super();

        this.position.set(rect.x, rect.y);
        this._size = [rect.width, rect.height];
        this._borderScale = 1.0;
        this._color = panelColor;
        this._panelSize = panelSize;
        this._panelChildren = [];

        this._assemble();
    }

    addMember(child) {
        this._panelChildren.push(child);
        this._assemble();
    }

    _getBorderSprite(border) {
        let texture = new PIXI.Texture(
            PIXI.BaseTexture.from(core.SOURCE_PATH),
            new PIXI.Rectangle(...BORDER_FRAMES[this._panelSize][this._color][border])
        );
        let sprite = new PIXI.Sprite(texture);
        sprite.scale.set(this._borderScale, this._borderScale);
        return sprite;
    }

    _assemble() {
        let w = this._size[0];
        let h = this._size[1];
        let bw = Math.floor(RAW_BORDER_WIDTH[this._panelSize] * this._borderScale);
        let bh = Math.floor(RAW_BORDER_HEIGHT[this._panelSize] * this._borderScale);

        this.removeChildren();

        let bckgr = new PIXI.Graphics();
        bckgr.beginFill(BACKGROUND_COLOR[this._color]);
        bckgr.drawRect(Math.floor(bw / 2), Math.floor(bh / 2), w - bw, h - bh);
        bckgr.endFill();
        this.addChild(bckgr);

        // Corner borders
        let borders = {};
        for (let border of ["tl", "tr", "br", "bl"]) {
            borders[border] = this._getBorderSprite(border);
        }
        borders.tr.x = w - bw;
        borders.br.position.set(w - bw, h - bh);
        borders.bl.y = h - bh;
        this.addChild(borders.tl, borders.tr, borders.br, borders.bl);

        // Horizontal edges
        let curx = bw;
        while (curx < w - bw * 2) {
            let top = this._getBorderSprite("t");
            let bot = this._getBorderSprite("b");
            top.x = curx;
            bot.position.set(curx, h - bh);

            this.addChild(top, bot);
            curx += bw;
        }
        let topFill = this._getBorderSprite("t");
        topFill.x = w - bw * 2;
        let botFill = this._getBorderSprite("b");
        botFill.position.set(w - bw * 2, h - bh);
        this.addChild(topFill, botFill);

        // Vertical edges
        let cury = bh;
        while (cury < h - bh * 2) {
            let left = this._getBorderSprite("l");
            let right = this._getBorderSprite("r");
            left.y = cury;
            right.position.set(w - bw, cury);

            this.addChild(left, right);
            cury += bh;
        }
        let leftFill = this._getBorderSprite("l");
        leftFill.y = h - bh * 2;
        let rightFill = this._getBorderSprite("r");
        rightFill.position.set(w - bw, h - bh * 2);
        this.addChild(leftFill, rightFill);

        if (this._panelChildren.length > 0) this.addChild(...this._panelChildren);

        console.log("finished render");
    }
}

export default Panel;
