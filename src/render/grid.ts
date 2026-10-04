import { Complex } from '../math/complex';
import { formatNumber } from './formatNumber';
import { VIEW } from './view';

const UNITS = [
    { name: 'm',  scale: 1 },
    { name: 'km', scale: 1e3 },
    { name: 'Mm', scale: 1e6 },
    { name: 'Gm', scale: 1e9 },
    { name: 'AU', scale: 1.495978707e11 },
    { name: 'ly', scale: 9.4607304725808e15 },
];

const SWITCH_THRESHOLD: Record<string, number> = {
    AU: 2,  
    ly: 2,
};
/** 选一个让屏幕跨度落在 [1, 1000] 左右的单位 */

function pickUnit(spanMeters: number) {
    for (let i = UNITS.length - 1; i >= 0; i--) {
        const u = UNITS[i];
        const need = (SWITCH_THRESHOLD[u.name] ?? 1) * u.scale;
        if (spanMeters >= need) return u;
    }
    return UNITS[0];
}
function niceStep(spanMeters: number, targetPx: number, unitScale: number): number {
    const spanInUnit = spanMeters / unitScale;
    const raw = (targetPx / VIEW.width) * spanInUnit;
    const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
    for (const m of [1, 2, 5, 10]) {
        if (m * pow10 >= raw) return m * pow10 * unitScale;
    }
    return 10 * pow10 * unitScale;
}

function formatTick(v: number, unitName: string): string {
    if (v === 0) return `0 ${unitName}`;
    const a = Math.abs(v);
    // 绝大多数情况 v 在 [1, 1000]，用 toPrecision 去掉尾部多余 0
    if (a >= 1e5 || a < 1e-3) {
        return `${v.toExponential(1)} ${unitName}`;
    }
    return `${parseFloat(v.toPrecision(6))} ${unitName}`;
}

function fmt(v: number): string{
    return formatNumber(v)
}

export function drawGridAndAxes(ctx: CanvasRenderingContext2D) {
    const w = VIEW.width;
    const h = VIEW.height;
    const z = VIEW.zoom;

    // 屏幕四角对应的世界坐标范围
    const xMin = VIEW.center.real - (w / 2) / z;
    const xMax = VIEW.center.real + (w / 2) / z;
    const yMin = VIEW.center.im - (h / 2) / z;
    const yMax = VIEW.center.im + (h / 2) / z;
    
    const spanX = xMax - xMin;
    const spanY = yMax - yMin;

    const unitX = pickUnit(spanX);          // ← 新增
    const unitY = pickUnit(spanY);          // ← 新增
    const stepX = niceStep(xMax - xMin, 120,unitX.scale);
    const stepY = niceStep(yMax - yMin, 120,unitY.scale);

    ctx.save();

    // ---- 1. 网格线 ----
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
        const [sx] = VIEW.worldPosToViewPos(new Complex(x, 0));
        ctx.moveTo(Math.round(sx) + 0.5, 0);
        ctx.lineTo(Math.round(sx) + 0.5, h);
    }
    for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
        const [, sy] = VIEW.worldPosToViewPos(new Complex(0, y));
        ctx.moveTo(0, Math.round(sy) + 0.5);
        ctx.lineTo(w, Math.round(sy) + 0.5);
    }
    ctx.stroke();

    // ---- 2. 坐标轴 ----
    const [ox, oy] = VIEW.worldPosToViewPos(new Complex(0, 0));

    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (oy >= 0 && oy <= h) { ctx.moveTo(0, oy); ctx.lineTo(w, oy); }   // x 轴
    if (ox >= 0 && ox <= w) { ctx.moveTo(ox, 0); ctx.lineTo(ox, h); }   // y 轴
    ctx.stroke();

    // ---- 3. 刻度数值 ----
    ctx.fillStyle = '#6a6a6a';
    ctx.font = '11px';

    // x 轴刻度（贴 x 轴，若 x 轴不在屏幕内就贴底）
    const labelY = (oy >= 0 && oy <= h) ? oy + 3 : h - 20;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
        if (x === 0) continue;
        const [sx] = VIEW.worldPosToViewPos(new Complex(x, 0));
        ctx.fillText(formatTick(x/unitX.scale, unitX.name), sx + 2, labelY);
    }

    // y 轴刻度（贴 y 轴，若 y 轴不在屏幕内就贴左）
    const labelX = (ox >= 0 && ox <= w) ? ox + 3 : 4;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
        if (y === 0) continue;
        const [, sy] = VIEW.worldPosToViewPos(new Complex(0, y));
        ctx.fillText(formatTick(y / unitY.scale, unitY.name), labelX, sy - 2);
    }

    // ---- 4. 原点标记 ----
    if (ox >= 0 && ox <= w && oy >= 0 && oy <= h) {
        ctx.fillStyle = '#7a7a7a';
        ctx.fillText('0', ox + 3, oy + 3);
    }

    ctx.restore();
}
