import {Complex} from "../math/complex";
import { AU, G, M_SUN } from "./constants";

export class PhysicObject{
    mass: number;
    position: Complex;
    velocity: Complex = new Complex(0,0);
    constructor(mass: number = 1, pos: Complex = new Complex(0,0)) {
        this.mass = mass;
        this.position = pos;
    }

}

export class Force{
    vector: Complex;
    constructor(vector: Complex) {
        this.vector = vector;
    }
    absVal() {
        return this.vector.abs();
    }
    merge(x: Force) {
        return new Force((this.vector).add(x.vector))
    }
}

export function createPlanetAroundSun(mass: number, distanceAU: number,centerMass: number = M_SUN) {
    let x = new PhysicObject(mass, new Complex(distanceAU*AU,0));
    x.velocity=new Complex(0, Math.sqrt(G * centerMass / (distanceAU*AU)));
    return x;
}