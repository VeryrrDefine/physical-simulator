import { Complex } from '../math/complex';

export class View {
    center: Complex = new Complex(0, 0);
    zoom: number = 100 / 149_597_870_700;
    readonly width = 720;
    readonly height = 720;

    /** 当前锁定的目标；null 表示自由视角 */
    followed: { position: Complex } | null = null;

    follow(target: { position: Complex } | null) {
        this.followed = target;
    }

    /** 每帧渲染前调用一次 */
    applyFollow() {
        if (this.followed) {
            this.center.real = this.followed.position.real;
            this.center.im   = this.followed.position.im;
        }
    }

    worldPosToViewPos(x: Complex) {
        const p = x.subtract(this.center).mult(this.zoom);
        return [p.real + this.width / 2, -p.im + this.height / 2];
    }
}

export const VIEW = new View();