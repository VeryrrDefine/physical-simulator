import type { Complex } from "../math/complex";
import { M_EARTH, M_SUN } from "../physic/constants";

export function formatNumber(x: number): string {
    if (x<0) return `-${formatNumber(-x)}`
    if (x < 0.1) {
        return x.toExponential(4)
    }
    if (x < 10000) {
        return x.toFixed(4);
    }

    return x.toExponential(4);
}
export function formatComplex(x :Complex) {
    return `${formatNumber(x.real)}${x.im>=0?"+":""}${formatNumber(x.im)}i`
}
export function formatTime(x: number) {
    // if (x>=31558153) {
    //     return `${formatNumber(x/31558153)}y`
    // }
    // if (x>=86400) {
    //     return `${formatNumber(x/86400)} d`
    // }
    // if (x>=3600) {
    //     return `${formatNumber(x/3600)} h`
    // }
    return `${formatNumber(x)} s`
} 
export function formatMass(x: number) {
    if (x >= M_SUN) {
        return formatNumber(x/M_SUN) + " M Sun"
    }
    if (x >= M_EARTH) {
        return formatNumber(x/M_EARTH) + " M Earth"
    }
    return formatNumber(x) + " kg"
}