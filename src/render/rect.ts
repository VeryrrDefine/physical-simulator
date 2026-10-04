export class Rect {
	left: number = 0;
	top: number = 0;
	width: number = 0;
	height: number = 0;

	constructor(x?: number, y?: number, width?: number, height?: number);
	constructor(rect: Rect);
	constructor(left?: number | Rect, top?: number, width?: number, height?: number) {
		if (typeof left === 'object' && left !== null) {
			const rect = left as Rect;
			this.left = rect.left;
			this.top = rect.top;
			this.width = rect.width;
			this.height = rect.height;
		} else if (
			left !== undefined &&
			top !== undefined &&
			width !== undefined &&
			height !== undefined
		) {
			this.left = left;
			this.top = top;
			this.width = width;
			this.height = height;
		}
	}

	get x() {
		return this.left;
	}
	set x(s: number) {
		this.left = s;
	}

	get y() {
		return this.top;
	}
	set y(s: number) {
		this.top = s;
	}

	get right() {
		return this.left + this.width;
	}
	set right(value: number) {
		this.left = value - this.width;
	}

	get bottom() {
		return this.top + this.height;
	}
	set bottom(value: number) {
		this.top = value - this.height;
	}

	get centerx() {
		return this.left + this.width / 2;
	}
	set centerx(value: number) {
		this.left = value - this.width / 2;
	}

	get centery() {
		return this.top + this.height / 2;
	}
	set centery(value: number) {
		this.top = value - this.height / 2;
	}

	get center(): [number, number] {
		return [this.centerx, this.centery];
	}
	set center(value: [number, number]) {
		this.centerx = value[0];
		this.centery = value[1];
	}

	get topleft(): [number, number] {
		return [this.left, this.top];
	}
	set topleft(value: [number, number]) {
		this.left = value[0];
		this.top = value[1];
	}

	get topright(): [number, number] {
		return [this.right, this.top];
	}
	set topright(value: [number, number]) {
		this.right = value[0];
		this.top = value[1];
	}

	get bottomleft(): [number, number] {
		return [this.left, this.bottom];
	}
	set bottomleft(value: [number, number]) {
		this.left = value[0];
		this.bottom = value[1];
	}

	get bottomright(): [number, number] {
		return [this.right, this.bottom];
	}
	set bottomright(value: [number, number]) {
		this.right = value[0];
		this.bottom = value[1];
	}

	get midtop(): [number, number] {
		return [this.centerx, this.top];
	}
	set midtop(value: [number, number]) {
		this.centerx = value[0];
		this.top = value[1];
	}

	get midleft(): [number, number] {
		return [this.left, this.centery];
	}
	set midleft(value: [number, number]) {
		this.left = value[0];
		this.centery = value[1];
	}

	get midbottom(): [number, number] {
		return [this.centerx, this.bottom];
	}
	set midbottom(value: [number, number]) {
		this.centerx = value[0];
		this.bottom = value[1];
	}

	get midright(): [number, number] {
		return [this.right, this.centery];
	}
	set midright(value: [number, number]) {
		this.right = value[0];
		this.centery = value[1];
	}

	get size(): [number, number] {
		return [this.width, this.height];
	}
	set size(value: [number, number]) {
		this.width = value[0];
		this.height = value[1];
	}

	get w() {
		return this.width;
	}
	set w(value: number) {
		this.width = value;
	}

	get h() {
		return this.height;
	}
	set h(value: number) {
		this.height = value;
	}

	// 碰撞检测
	collidepoint(x: number, y: number): boolean {
		return isInRect(x, y, this.left, this.top, this.right, this.bottom);
	}

	colliderect(other: Rect): boolean {
		return !(
			other.left > this.right ||
			other.right < this.left ||
			other.top > this.bottom ||
			other.bottom < this.top
		);
	}

	collidelist(rects: Rect[]): number {
		for (let i = 0; i < rects.length; i++) {
			if (this.colliderect(rects[i])) return i;
		}
		return -1;
	}

	collidelistall(rects: Rect[]): number[] {
		const indices: number[] = [];
		for (let i = 0; i < rects.length; i++) {
			if (this.colliderect(rects[i])) indices.push(i);
		}
		return indices;
	}

	collideobjects(objects: { rect: Rect }[]): any[] {
		return objects.filter((obj) => this.colliderect(obj.rect));
	}

	// 移动操作
	move(dx: number, dy: number): Rect {
		return this.clone().move_ip(dx, dy);
	}

	move_ip(dx: number, dy: number): this {
		this.left += dx;
		this.top += dy;
		return this;
	}

	// 缩放操作
	inflate(dx: number, dy: number): Rect {
		return this.clone().inflate_ip(dx, dy);
	}

	inflate_ip(dx: number, dy: number): this {
		this.left -= dx / 2;
		this.width += dx;
		this.top -= dy / 2;
		this.height += dy;
		return this;
	}

	// 裁剪/交集
	clip(other: Rect): Rect | null {
		const newLeft = Math.max(this.left, other.left);
		const newTop = Math.max(this.top, other.top);
		const newRight = Math.min(this.right, other.right);
		const newBottom = Math.min(this.bottom, other.bottom);

		if (newLeft < newRight && newTop < newBottom) {
			return new Rect(newLeft, newTop, newRight - newLeft, newBottom - newTop);
		}
		return null; // 无交集
	}

	// 并集（包含两个矩形的最小矩形）
	union(other: Rect): Rect {
		const newLeft = Math.min(this.left, other.left);
		const newTop = Math.min(this.top, other.top);
		const newRight = Math.max(this.right, other.right);
		const newBottom = Math.max(this.bottom, other.bottom);
		return new Rect(newLeft, newTop, newRight - newLeft, newBottom - newTop);
	}

	// 修正负宽高（转为正常方向）
	normalize(): this {
		if (this.width < 0) {
			this.width = -this.width;
			this.left -= this.width;
		}
		if (this.height < 0) {
			this.height = -this.height;
			this.top -= this.height;
		}
		return this;
	}

	// 检测是否包含另一个矩形
	contains(other: Rect): boolean {
		return (
			this.left <= other.left &&
			this.right >= other.right &&
			this.top <= other.top &&
			this.bottom >= other.bottom
		);
	}

	// 将矩形限制在另一个矩形内（类似 clamp）
	clamp_ip(other: Rect): this {
		if (this.left < other.left) this.left = other.left;
		if (this.right > other.right) this.left = other.right - this.width;
		if (this.top < other.top) this.top = other.top;
		if (this.bottom > other.bottom) this.top = other.bottom - this.height;
		return this;
	}

	clamp(other: Rect): Rect {
		return this.clone().clamp_ip(other);
	}

	// 复制
	clone(): Rect {
		return new Rect(this.left, this.top, this.width, this.height);
	}

	// 实用方法
	equals(other: Rect): boolean {
		return (
			this.left === other.left &&
			this.top === other.top &&
			this.width === other.width &&
			this.height === other.height
		);
	}

	get area(): number {
		return this.width * this.height;
	}

	get perimeter(): number {
		return 2 * (this.width + this.height);
	}

	// 获取四个顶点坐标
	getVertices(): [
		lt: [number, number],
		rt: [number, number],
		rb: [number, number],
		lb: [number, number],
	] {
		return [
			[this.left, this.top],
			[this.right, this.top],
			[this.right, this.bottom],
			[this.left, this.bottom],
		];
	}

	// 与 Pygame 类似的 update 方法
	update(x: number, y: number, width: number, height: number): this {
		this.left = x;
		this.top = y;
		this.width = width;
		this.height = height;
		return this;
	}

	// 转字符串
	toString(): string {
		return `Rect(left=${this.left}, top=${this.top}, width=${this.width}, height=${this.height})`;
	}
}

// 工具函数
export function isInRect(
	px: number,
	py: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
): boolean {
	return px >= x1 && px <= x2 && py >= y1 && py <= y2;
}

// 创建一个矩形数组的辅助函数
export function createRects(positions: { x: number; y: number; w: number; h: number }[]): Rect[] {
	return positions.map((pos) => new Rect(pos.x, pos.y, pos.w, pos.h));
}
