import { assets } from './assets';
import { mouse } from '../mouse';
import { Rect } from './rect';
import { TextDrawer, type Align, type VerticialAlign } from './text';
import { WORLD } from '../physic/world';
import { VIEW } from './view';
import { formatComplex, formatMass, formatNumber, formatTime } from './formatNumber';
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
	// 每3秒切换一次调试信息显示模式
	const DEBUG_MODE_INTERVAL = 3000;

	const modeInfo = getModeInfo();

	const mode = Math.floor(Date.now() / DEBUG_MODE_INTERVAL) % modeInfo.length;

	let firstrow = modeInfo[mode];

	let rows = [];
	let i = -1;
	for (const obj of WORLD.objects) {
		i++;
		rows.push(`${i} ${formatMass(obj.mass)} 位置${formatComplex(obj.position)}  v=${formatComplex(obj.velocity)} |v|=${formatNumber(obj.velocity.abs())}`)
	}
	rows.push(`t=${formatTime(WORLD.time)}`)
	return `${firstrow}\n`+rows.join("\n");
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
	  ) & {
			onClick?(): void;
	  })
	| {
			type: 'group';
			condition(): boolean;
			group(): UIopt[];
	  };

export const UI = [
	{
		type: 'text',
		size: 21,
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
			let obj = [] as UIopt[]
			const objsize = 8;
			for (const o of WORLD.objects) {
				let res = VIEW.worldPosToViewPos(o.position);

				obj.push(
					{
						type: "rect",
						rect: new Rect(res[0]-objsize/2,res[1]-objsize/2,objsize, objsize),
						fore: "#ffffff"
					}
				)
			}
			return obj;
		}
	}
] as const satisfies UIopt[];
