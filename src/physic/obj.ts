import {Complex} from "../math/complex";
import { AU, G, M_SUN } from "./constants";

export class PhysicObject{
    mass: number;
    position: Complex;
    velocity: Complex = new Complex(0,0);
    constructor(mass: number = 1, pos: Complex = new Complex(0,0), color: string = "#ffffff") {
        this.mass = mass;
        this.position = pos;
        this.color = color;
    }
    color: string;
    text: string = "Default Planet";
    setText(x: string) {
        this.text = x
        return this;
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

export function createPlanetAroundSun(
    mass: number,
    distanceAU: number,
    angle: number = 0,          // 新增：初始角度（弧度）
    color: string = "#ffffff",
    centerMass: number = M_SUN,
) {
    const r = distanceAU * AU;
    const v = Math.sqrt(G * centerMass / r);
    const obj = new PhysicObject(
        mass,
        new Complex(r * Math.cos(angle), r * Math.sin(angle)),
        color
    );
    obj.velocity = new Complex(-v * Math.sin(angle), v * Math.cos(angle));
    return obj;
}

/**
 * 在 parent 周围创建一颗卫星。
 * @param parent        中心天体（它的 position / velocity 必须已经设好）
 * @param mass          卫星质量 kg
 * @param distance      轨道半径 m
 * @param angle         初始相位（弧度）
 */
export function createSatelliteAround(
    parent: PhysicObject,
    mass: number,
    distance: number,
    angle: number = 0,
) {
    // 用约化质量 μ = G(M + m)，对月球这种质量不算忽略的卫星更准
    const mu = G * (parent.mass + mass);
    const v = Math.sqrt(mu / distance);

    // 相对 parent 的位置和速度（圆轨道，逆时针）
    const relPos = new Complex(
        distance * Math.cos(angle),
        distance * Math.sin(angle),
    );
    const relVel = new Complex(
        -v * Math.sin(angle),
        v * Math.cos(angle),
    );

    const sat = new PhysicObject(
        mass,
        parent.position.add(relPos),          // 位置 = 父位置 + 相对位置
    );
    sat.velocity = parent.velocity.add(relVel); // 速度 = 父速度 + 相对速度
    return sat;
}