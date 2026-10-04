import {Complex} from '../math/complex';

export class View {
    center: Complex = new Complex(0, 0);
    zoom: number = 100 / 149_597_870_700; // 1 AU = 100 px
    readonly width = 720;
    readonly height = 720;

    worldPosToViewPos(x: Complex): [number, number] {
        const p = x.subtract(this.center).mult(this.zoom);
        return [p.real + this.width / 2, -p.im + this.height / 2];
    }
}

export const VIEW = new View();

