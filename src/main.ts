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
        VIEW.follow(null);
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

    canvas.addEventListener('wheel', (e) => {
    e.preventDefault();                 // 阻止页面滚动
    lastMove = Date.now();

    const oldZoom = VIEW.zoom;
    const factor = 2 ** (-e.deltaY / 300);
    const newZoom = oldZoom * factor;

    // 限制缩放范围，防止变成 0 或 Infinity
    const MIN_ZOOM = 1e-20;
    const MAX_ZOOM = 1e3;
    if (newZoom < MIN_ZOOM || newZoom > MAX_ZOOM) return;

    const mx = mouse.mouseX;
    const my = mouse.mouseY;

     if (VIEW.followed) {
        // 跟随：以天体为中心缩放，center 不动
        VIEW.zoom = newZoom;
    } else {
        // 自由视角：以鼠标为中心缩放
        const k = 1 / oldZoom - 1 / newZoom;
        VIEW.center.real += (mx - VIEW.width  / 2) * k;
        VIEW.center.im   -= (my - VIEW.height / 2) * k;
        VIEW.zoom = newZoom;
    }
}, { passive: false });   // 必须 passive:false 才能 preventDefault

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



window.WORLD = WORLD;
window.Complex = Complex;
window.VIEW = VIEW;