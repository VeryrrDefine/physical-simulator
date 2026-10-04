import { assets } from './assets';
import { mouse } from '../mouse';
import { Rect } from './rect';
import { TextDrawer, type Align, type VerticialAlign } from './text';
import { WORLD } from '../physic/world';
import { VIEW } from './view';
import { formatComplex, formatMass, formatNumber, formatTime } from './formatNumber';
import type { PhysicObject } from '../physic/obj';

// ui.ts 顶部
export const pager = {
    pageIndex: 0,
    pageSize: 5,
};

function getScaleBar(zoom: number) {

	// if (zoom >= 1){
	// 	return `${formatNumber(zoom)} px/meter`;
	// }
	return `1 px/${formatNumber(1/zoom)} meter`
}
function getModeInfo() {
	// 鼠标坐标转换系数
	const mousePos = `${mouse.mouseX},${mouse.mouseY}`;
	return [`player ${mousePos}, ${getScaleBar(VIEW.zoom)}`];
}

function debuggingInformation(): string {
    const DEBUG_MODE_INTERVAL = 3000;
    const modeInfo = getModeInfo();
    const mode = Math.floor(Date.now() / DEBUG_MODE_INTERVAL) % modeInfo.length;
    const firstrow = modeInfo[mode];

    const total = WORLD.objects.length;
    const pageCount = Math.max(1, Math.ceil(total / pager.pageSize));
    if (pager.pageIndex >= pageCount) pager.pageIndex = pageCount - 1;   // 越界保护

    const start = pager.pageIndex * pager.pageSize;
    const end = Math.min(start + pager.pageSize, total);

    const rows: string[] = [];
    for (let i = start; i < end; i++) {
        const obj = WORLD.objects[i];
        rows.push(
            `${i} ${obj.text} ${formatMass(obj.mass)} |v|=${formatNumber(obj.velocity.abs())} position=${formatComplex(obj.position)}\nv=${formatComplex(obj.velocity)}`
        );
    }

    const header = `[${pager.pageIndex + 1}/${pageCount}]  PageUp/PageDown 翻页`;
    return `${firstrow}\n${header}\n` + rows.join("\n") + `\nt=${formatTime(WORLD.time)}`;
}

function labelPriority(o: PhysicObject): number {
    if (o === VIEW.followed) return Infinity;   // 被跟随永远最高
    return o.mass;
}

function buildLabels(
    items: { o: PhysicObject; sx: number; sy: number; r: number }[],
): UIopt[] {
    const LABEL_H = 24;
    const LABEL_W = (text: string) => 7 * text.length + 6;   // 12px 字体粗估
    const PAD = 4;

    const sorted = [...items].sort((a, b) => labelPriority(b.o) - labelPriority(a.o));

    const placed: Rect[] = [];
    const labels: UIopt[] = [];

    for (const { o, sx, sy, r } of sorted) {
        // 屏幕外直接跳过（省一次碰撞检测）
        if (sx < -100 || sx > VIEW.width + 100) continue;
        if (sy < -100 || sy > VIEW.height + 100) continue;

        const w = LABEL_W(o.text);
        const rect = new Rect(sx + r + 6, sy - LABEL_H / 2, w, LABEL_H);

        // 用 colliderect 检测，先把 rect 扩 pad 再看是否撞上已占位的
        const expanded = rect.inflate(PAD * 2, PAD * 2);
        const hasCollision = placed.some(p => expanded.colliderect(p));
        if (hasCollision) continue;

        placed.push(rect);       // 存原始 rect，不是 expanded
        labels.push({
            type: 'text',
            rect,
            text: () => o.text,
            fore: o.color,
            size: 16,
            align: ['left', 'top'],
        });
    }

    return labels;
}


export function executeUI(x: UIopt, mouseX: number, mouseY: number, ctx: CanvasRenderingContext2D) {
	let rect = rectizeUI(x, ctx);
	if (!rect) return;
	if (rect.collidepoint(mouseX, mouseY)) {
		if (x.type == 'group') {
			for (const ui of x.group()) {
				executeUI(ui, mouseX, mouseY, ctx);
			}
			return;
		}
		console.log('I have been executed: ', x);
		x.onClick?.();
	}
}
export function rectizeUI(x: UIopt, ctx: CanvasRenderingContext2D): Rect | null {
	switch (x.type) {
		case 'text':
			let drawer = new TextDrawer(x.text(), x.size, x.fore ?? '#ffffff', 'left');
			drawer.align = typeof x.align == 'string' ? x.align : x.align[0];
			if (Array.isArray(x.align)) drawer.verticialAlign = x.align[1];

			return drawer.toRect(x.rect, ctx);

		case 'group':
			if (x.condition()) {
				let rects: Rect[] = [];
				for (const ui of x.group()) {
					let r = rectizeUI(ui, ctx);
					if (r) rects.push(r);
				}
				return rects.reduce((prev, cur) => prev.union(cur));
			} else {
				return null;
			}
		case 'rect':
			return x.rect;
		case 'image':
			return new Rect(
				x.canvas_left,
				x.canvas_top,
				x.canvas_width ?? x.image_width,
				x.canvas_height ?? x.image_height,
			);
		case 'circle':
    		return new Rect(x.cx - x.r, x.cy - x.r, x.r * 2, x.r * 2);
			
	}
}
export function drawUI(x: UIopt, ctx: CanvasRenderingContext2D) {
	switch (x.type) {
		case 'text':
			let drawer = new TextDrawer(
				x.text(),
				x.size,
				(x.foreDynamic ? x.foreDynamic() : x.fore) ?? '#ffffff',
				'left',
			);
			drawer.align = typeof x.align == 'string' ? x.align : x.align[0];
			if (Array.isArray(x.align)) drawer.verticialAlign = x.align[1];

			drawer.drawInRect(x.rect, ctx);
			break;
		case 'group':
			if (x.condition()) {
				for (const ui of x.group()) {
					drawUI(ui, ctx);
				}
			}
			break;
		case 'rect':
			ctx.fillStyle = x.foreDynamic ? x.foreDynamic() : x.fore;
			ctx.fillRect(x.rect.left, x.rect.top, x.rect.width, x.rect.height);
			break;
		case 'image':
			let sx = x.image_left;
			let sy = x.image_top;
			let sw = x.image_width;
			let sh = x.image_height;
			let dx = x.canvas_left;
			let dy = x.canvas_top;
			let dw = x.canvas_width ?? x.image_width;
			let dh = x.canvas_height ?? x.image_height;
			ctx.drawImage(assets.image, sx, sy, sw, sh, dx, dy, dw, dh);
			return;
		case 'circle':
			ctx.fillStyle = x.fore;
			ctx.beginPath();
			ctx.arc(x.cx, x.cy, x.r, 0, Math.PI * 2);
			ctx.fill();
			break;
	}
}

export type UIopt =
	| ((
			| {
					type: 'text';
					rect: Rect;
					text(): string;
					fore?: string;
					foreDynamic?(): string;
					back?: string;
					size: number;
					align: [Align, VerticialAlign] | Align;
			  }
			| {
					type: 'rect';
					rect: Rect;
					foreDynamic?(): string;
					fore: string;
			  }
			| {
					type: 'image';
					image_left: number;
					image_top: number;
					image_width: number;
					image_height: number;
					canvas_left: number;
					canvas_top: number;
					canvas_width?: number;
					canvas_height?: number;
			  }
			  | {
				type: 'circle';
				cx: number;
				cy: number;
				r: number;
				fore: string;
			}
	  ) & {
			onClick?(): void;
	  })
	| {
			type: 'group';
			condition(): boolean;
			group(): UIopt[];
	  };

function visualRadius(o: PhysicObject): number {
    if (o === VIEW.followed) return 6;         // 被跟随时画大一点，方便看
    if (o.mass > 1e29) return 8;               // 恒星
    if (o.mass > 1e21) return 4;               // 行星
    return 2.5;                                // 卫星
}

export const UI = [
	{
		type: 'text',
		size: 16,
		rect: new Rect(0, 10, 720, 720),
		fore: '#008cff',
		align: ['left', 'top'],
		text() {
			return debuggingInformation();
		},
	},
	{
		type: "group",
		condition() {
			return true
		},
		group() {
			const circles: UIopt[] = [];
			const items: { o: PhysicObject; sx: number; sy: number; r: number }[] = [];

			for (const o of WORLD.objects) {
				const [sx, sy] = VIEW.worldPosToViewPos(o.position);
				const r = visualRadius(o);
				items.push({ o, sx, sy, r });

				// 画外环和本体
				if (o === VIEW.followed) {
					circles.push({ type: 'circle', cx: sx, cy: sy, r: r + 4, fore: 'rgba(255,255,255,0.25)' });
				}
				circles.push({ type: 'circle', cx: sx, cy: sy, r, fore: o.color });
			}

			// 标签单独算，防重叠
			const labels = buildLabels(items);
			// const labels = [];
			// 先画圆点，再画标签（保证文字在最上层）
			return [...circles, ...labels];
		}
	}
] as const satisfies UIopt[];
