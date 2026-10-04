import { Complex } from "../math/complex";


export function oneize(x: Complex) {
    if (x.real == 0 && x.im == 0) return new Complex(0,0);
    let arg = x.arg()
    return new Complex(Math.cos(arg), Math.sin(arg));
}