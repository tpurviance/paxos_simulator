var Rectangle = function(x,y,width,height,color,fill) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;
	this.fill = fill;
}

Rectangle.prototype.draw = function (context) {
	if (this.fill) {
		this.strokeFillDraw(context);
	} else {
		this.strokeDraw(context);
	}
}

Rectangle.prototype.strokeDraw = function (context) {
	var f = Math.floor;
	context.fillStyle = this.color;
	context.strokeRect(f(this.x), f(this.y), f(this.width), f(this.height));
}

Rectangle.prototype.fillDraw = function (context) {
	var f = Math.floor;
	context.fillStyle = this.color;
	context.fillRect(f(this.x), f(this.y), f(this.width), f(this.height));
}

Rectangle.prototype.strokeFillDraw = function (context) {
	var f = Math.floor;
	context.fillStyle = "rgb(0,0,0)";
	context.fillRect(f(this.x), f(this.y), f(this.width), f(this.height));
	context.fillStyle = this.color;
	context.fillRect(f(this.x+1), f(this.y+1), f(this.width-2), f(this.height-2));
}

Rectangle.prototype.move = function(dx, dy) {
	this.x += dx;
	this.y += dy;
}
