import { WORLD } from "./world";

/** 模拟秒 / 实际秒 */
let timeScale = 1;

export function setTimeScale(s: number) {
    timeScale = s;
}
export function getTimeScale() {
    return timeScale;
}

let lastTime = performance.now();

export function loop() {
    const now = performance.now();
    // 真实经过的秒数，上限 0.1s，避免切标签页回来时时间跳变
    const dtReal = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    const simSeconds = dtReal * timeScale;

    // 拆子步，保证每步 dt 不会大到让 Verlet 失真
    const SUBSTEPS = 20;
    const dt = simSeconds / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) {
        WORLD.tick(dt);
    }
}