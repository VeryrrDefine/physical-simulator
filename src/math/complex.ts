export class Complex {
    real: number = 0;
    im: number = 0;
    constructor(real: number, im: number) {
        this.real = real;
        this.im = im;
    }
    arg() {
        return Math.atan2(this.im, this.real);
    }
    abs() {
        return Math.hypot(this.real, this.im);
    }
    add(y: Complex) {
        return new Complex(this.real + y.real, this.im + y.im);
    }
    subtract(y: Complex) {
        return new Complex(this.real - y.real, this.im - y.im);
    }
    mult(y: number) {
        return new Complex(this.real * y, this.im * y);
    }
    conjecture() {
        return new Complex(this.real , -this.im)
    }
}