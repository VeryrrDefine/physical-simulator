import {Complex} from './math/complex';
import { mouse } from './mouse';
import { WORLD } from './physic/world';
import { initRenderer, renderGame } from './render/render';
import './style.css';
import { loop } from './physic';
import { VIEW } from './render/view';

let canvas: HTMLCanvasElement;
let assets: HTMLImageElement;

// 拖拽平移状态
let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartCenter = new Complex(0, 0);

document.addEventListener('DOMContentLoaded', () => {
	canvas = document.querySelector('canvas')!;
	assets = document.querySelector('img')!;
	initRenderer(canvas, assets);

	canvas.addEventListener('mousemove', (e) => {
		mouse.mouseX = e.offsetX;
		mouse.mouseY = e.offsetY;
	});

    
    canvas.addEventListener('mousedown', (e) => {
        dragging = true;
        dragStartX = e.offsetX;
        dragStartY = e.offsetY;
        // 记住起点时的 center，注意要拷贝一份，别直接引用
        dragStartCenter = new Complex(VIEW.center.real, VIEW.center.im);
        canvas.style.cursor = 'grabbing';
    });

    // mouseup 挂到 window 上，避免鼠标移出 canvas 后松开导致状态卡住
    window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mousemove', (e) => {
        mouse.mouseX = e.offsetX;
        mouse.mouseY = e.offsetY;

        if (!dragging) return;

        const dxPx = e.offsetX - dragStartX;
        const dyPx = e.offsetY - dragStartY;

        // 原地修改，保留 VIEW.center 的引用（其他代码可能持有它）
        VIEW.center.real = dragStartCenter.real - dxPx / VIEW.zoom;
        VIEW.center.im   = dragStartCenter.im   + dyPx / VIEW.zoom;
    });

    // 初始光标提示可拖拽
    canvas.style.cursor = 'grab';

	canvas.addEventListener('click', () => {});

	canvas.addEventListener('dblclick', () => {});
	setInterval(() => renderGame(), 50);
	//   setInterval(() => save(), 1000);
	  setInterval(() => loop(), 50);
});
let lastMove = Date.now();
let patterns_last10: string[] = [];
// window.patterns_last10 = patterns_last10;
document.addEventListener('keydown', (e) => {
	const key = e.key;

	// console.log(key);
	patterns_last10.push(key);
	if (patterns_last10.length > 10) {
		patterns_last10.shift();
	}
});

document.addEventListener('wheel', function (e) {
	lastMove = Date.now();
    // e.deltaX
    VIEW.zoom *= 2**(-e.deltaY/300)
});


window.WORLD = WORLD;
window.Complex = Complex;