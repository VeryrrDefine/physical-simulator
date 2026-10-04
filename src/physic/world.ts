import {Complex} from '../math/complex';
import { createPlanetAroundSun, Force, PhysicObject } from './obj';
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

export const WORLD = new World(
    [
        new PhysicObject(M_SUN, new Complex(0, 0)),
        createPlanetAroundSun(3.3011e23, 0.307499),
        createPlanetAroundSun(4.8675e24, 0.718440),
        createPlanetAroundSun(M_EARTH, 1),
        createPlanetAroundSun(6.4171e23, 1.382),
        createPlanetAroundSun(1.8982e27, 4.9501),
    ]
);
