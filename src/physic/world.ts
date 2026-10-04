import {Complex} from '../math/complex';
import { createPlanetAroundSun, createSatelliteAround, Force, PhysicObject } from './obj';
import { AU, G, M_EARTH, M_SUN } from './constants';
import {  oneize } from './math';

export class World {
	objects: PhysicObject[];
    time: number=0;

	constructor(objects: PhysicObject[] = []) {
		this.objects = objects;
	}
    getForce(obj: PhysicObject) {
        let force2: Force =new Force( new Complex(0,0));
        for (const obj2 of this.objects) {
            if (obj === obj2) continue;
            const m1 = obj.mass;
            const m2 = obj2.mass;
            const diff = obj2.position.subtract(obj.position); 
            const r = diff.abs();                              
            if (r === 0) continue;                             

            // (G*m1*m2/r**2) * e^(i ->obj obj2)
            const forceAbs = (G*m1*m2/r**2);
            force2 = force2.merge(new Force(oneize((obj2.position).subtract(obj.position)).mult(forceAbs)));
            
        }

        return force2;

    }
    tick(seconds = 0.01) {
        // 半 R 计算当前加速度
        const acc = new Map<PhysicObject, Complex>();
        for (const obj of this.objects) {
            acc.set(obj, this.getForce(obj).vector.mult(1 / obj.mass));
        }

        // 第一步：v += a * dt/2，然后 x += v * dt
        for (const obj of this.objects) {
            const a = acc.get(obj)!;
            obj.velocity = obj.velocity.add(a.mult(seconds * 0.5));
            obj.position = obj.position.add(obj.velocity.mult(seconds));
        }

        // 第二步：用新位置重算 a，再 v += a * dt/2
        for (const obj of this.objects) {
            const a = this.getForce(obj).vector.mult(1 / obj.mass);
            obj.velocity = obj.velocity.add(a.mult(seconds * 0.5));
        }
        this.time+=seconds
    }
}
const earth = createPlanetAroundSun(M_EARTH,   1.000, 4.0, "#3d8bff").setText("地球");       // 角度 4.0
const moon  = createSatelliteAround(earth, 7.342e22, 3.844e8, 0).setText("月球");  // 地月距离 384400 km

const mars = createPlanetAroundSun(6.4171e23, 1.524, 5.6, "#c1440e").setText("火星");


const phobos = createSatelliteAround(mars, 1.0659e16, 9.376e6,  0).setText("火卫一");    // 火卫一
const deimos = createSatelliteAround(mars, 1.4762e15, 2.3463e7, 2.5).setText("火卫二");  // 火卫二

const saturn  = createPlanetAroundSun(5.683e26,  9.537,  3.8, "#e3d9a0").setText("土星");
const uranus  = createPlanetAroundSun(8.681e25, 19.191,  0.5, "#7ad7e0").setText("天王星");
const neptune = createPlanetAroundSun(1.024e26, 30.070,  5.3, "#3f54ba").setText("海王星");
const pluto   = createPlanetAroundSun(1.303e22, 39.482,  2.0, "#c9b8a8").setText("冥王星");

export const WORLD = new World([
    createPlanetAroundSun(3.3011e23, 0.387, 0, "#a0a0a0").setText("水星"),  // 水星
    createPlanetAroundSun(4.8675e24, 0.723, 2.1, "#e6c47b").setText("火星"), // 金星
    
    moon,
    earth,
    phobos,
    deimos,

    mars,
    createPlanetAroundSun(1.8982e27, 5.203, 1.2, "#d9b28c").setText("木星"), // 木星
     saturn, uranus, neptune, pluto,
    new PhysicObject(M_SUN, new Complex(0, 0), "#ffcc33").setText("太阳"),
]);