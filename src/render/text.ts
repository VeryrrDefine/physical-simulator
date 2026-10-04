import { FONT } from './font';
import { Rect } from './rect';

export type Align = 'left' | 'center' | 'right';
export type VerticialAlign = 'top' | 'middle';
/**
 * 文字UI组件,垂直居中
 */
export class TextDrawer {
	/**
	 * 文字
	 */
	text: string;
	/**
	 * 排列方式
	 */
	align: Align;
	/**
	 * 垂直排列方式
	 */
	verticialAlign: VerticialAlign = 'middle';
	/**
	 * 基础文字大小，实际绘画会不一致
	 */
	fontSize: number;

	/**
	 * 文字颜色
	 */
	fore: string;

	/**
	 * 是否改变结果绘制大小
	 */
	autoChangeSize: boolean = true;

	constructor(text: string, fontSize: number, fore: string, align: Align = 'left') {
		this.text = text;
		this.align = align;
		this.fontSize = fontSize;
		this.fore = fore;
	}
	toRect(rect: Rect, ctx: CanvasRenderingContext2D): Rect {
		ctx.font = `${this.fontSize}px ${FONT}`;
		let rects = this.getPartRects(this.text.split('\n'), this.fontSize, rect, ctx);
		return rects.reduce((prev, cur) => prev.union(cur));
	}
	/**
	 * 在Rect里绘制文字,并画到ctx上
	 */
	drawInRect(rect: Rect, ctx: CanvasRenderingContext2D): void {
		/**
		 * 文字高度
		 */
		let textHeight = this.fontSize;
		/**
		 * 将文字按换行符分成小部分
		 */
		let parts = this.text.split('\n');
		ctx.font = `${textHeight}px ${FONT}`;
		if (this.autoChangeSize) {
			/**
			 * 文字限制的高度
			 */
			let limitWidth = rect.width;
			/**
			 * 所有part中文字的最大宽度
			 */
			let resultWidth = Math.max(...parts.map((x) => ctx.measureText(x).width));
			while (resultWidth > limitWidth) {
				textHeight -= 0.5;
				ctx.font = `${textHeight}px ${FONT}`;
				resultWidth = Math.max(...parts.map((x) => ctx.measureText(x).width));
			}
		}
		const partRects = this.getPartRects(parts, textHeight, rect, ctx);

		ctx.fillStyle = this.fore;
		for (let i = 0; i < parts.length; i++) {
			// 一个个画，并使用-5微调
			ctx.fillText(parts[i], partRects[i].left, partRects[i].bottom - 5);
		}
	}
	getPartRects(parts: string[], textHeight: number, rect: Rect, ctx: CanvasRenderingContext2D) {
		/**
		 * 绘画Rect列表
		 */
		const partRects: Rect[] = [];
		//partRects紧靠在rect的中间
		for (let i = 0; i < parts.length; i++) {
			/**绘画时的rect */
			let base = new Rect(0, 0, ctx.measureText(parts[i]).width, textHeight);

			switch (this.align) {
				case 'center':
					base.centerx = rect.centerx;
					break;
				case 'left':
					base.left = rect.left;
					break;
				case 'right':
					base.right = rect.right;
					break;
			}

			if (this.verticialAlign == 'middle') {
				base.centery =
					rect.centery - textHeight * ((parts.length - 1) / 2) + textHeight * i;
			}
			if (this.verticialAlign == 'top') {
				base.top = rect.top + textHeight * i;
			}
			partRects.push(base);
		}
		return partRects;
	}
}
