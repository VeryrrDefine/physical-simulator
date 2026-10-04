import { assets } from './assets';
import { FONT } from './font';
import { drawGridAndAxes } from './grid';
import { drawUI, UI } from './ui';
import { VIEW } from './view';

export let ctx: CanvasRenderingContext2D;

export function initRenderer(canvas: HTMLCanvasElement, img: HTMLImageElement) {
	ctx = canvas.getContext('2d')!;
	assets.image = img;
	ctx.font = `21px ${FONT}`; // HEIGHT = 21
}

export function renderGame() {
	ctx.font = `21px ${FONT}`; // HEIGHT = 21
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, 2000, 2000);

	VIEW.applyFollow();
	drawGridAndAxes(ctx);
	for (const ui of UI) {
		drawUI(ui, ctx);
	}
}
