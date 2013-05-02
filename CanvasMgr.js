/**
 * Singleton class, used to manage the canvas etc
 */
var CanvasMgr = function(canvas, w, h, fps){
	this.canvas = canvas;
	canvas.onclick=this.canvasClick;
	canvas.onkeypress = this.keyPress;
	this.waitTime = Math.floor(1000/fps);
	//this.canvas.width = ;
	//this.canvas.height = ;
	this.width = canvas.getBoundingClientRect().width;
	this.height = canvas.getBoundingClientRect().height;
	this.context2d = this.canvas.getContext("2d");
	this.backgroundColor = "rgb(255,255,255)";
	this.lastFrame = Date.now();
	this.frameTime = 0;
}
CanvasMgr.instance = null;
CanvasMgr.getInstance = function() {
	if (!CanvasMgr.instance) {
		CanvasMgr.instance = new CanvasMgr(document.getElementById('canvas'), window.screen.availWidth, window.screen.availHeight, 1000);
	}
	return CanvasMgr.instance;
}


// var rects = 10;
// IDK what Taylor's doing with these event handlers
CanvasMgr.prototype.canvasClick = function(event) {
	var clickedOn = NodeMgr.getInstance().getAtClick(event.offsetX, event.offsetY);
	if (clickedOn) { 
		clickedOn.switchRogue();
	}
};
CanvasMgr.prototype.keyPress = function() {
	console.log(String.fromCharCode(event.keyCode));
};


CanvasMgr.prototype.drawCanvas = function() {
	var ctx = this.context2d;
	
	ctx.fillStyle = this.backgroundColor;
	ctx.fillRect(0, 0, this.width, this.height);

	ctx.fillStyle = "rgb(0,0,0)";
	ctx.font="15px Arial";
	ctx.fillText("messages:" + MessageMgr.getInstance().movingMsgs.length , 8, 15);
	ctx.fillText("fps:" + Math.floor(1000.0 / CanvasMgr.getInstance().frameTime), 8, 30);
	
	NodeMgr.getInstance().drawNodes(ctx);
	MessageMgr.getInstance().drawMsgs(ctx);
	// for (var i = 0; i < this.drawables.length; i++) {
	// 	this.drawables[i].draw(ctx);
	// }
};

CanvasMgr.prototype.stepAnimations = function(time) {
	for (var i = 0; i < this.animations.length; i++) {
		this.animations[i].step(time);
	}
};

// CanvasMgr.prototype.addDrawable = function(drawable){
// 	this.drawables.push(drawable);
// 	this.drawables.sort(function(a,b){return b.depth-a.depth});
// };

// CanvasMgr.prototype.addDrawable = function(obj, depth) {
// 	var drawable = new Drawable(obj, depth);
// 	this.drawables.push(drawable);
// 	//var time = new Date().getTime();
// 	this.drawables.sort(function(a,b){return a.depth-b.depth});
// 	//time = new Date().getTime() - time;
// 	//console.log("" + rects + " - " + time);
// 	//this.draw();
// };
