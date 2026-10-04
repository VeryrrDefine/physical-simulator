import type { Complex } from "../math/complex";
import { M_EARTH, M_SUN } from "../physic/constants";

export function formatNumber(v: number): string {
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a >= 1e3 || a < 1e-3) {
        const exp = Math.floor(Math.log10(a));
        const mant = v / Math.pow(10, exp);
        return `${mant.toFixed(3)}e${exp}`;
    }
    return v.toFixed(3);
}
export function formatComplex(x :Complex) {
    return `${formatNumber(x.real)}${x.im>=0?"+":""}${formatNumber(x.im)}i`
}
export function formatTime(x: number) {
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