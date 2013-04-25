var MessageMgr = function() {
	this.movingMsgs = new Array();
}

MessageMgr.prototype.updateMsgs = function() {
	var doneMsgs = new Array();
	for(var i = 0; i < this.movingMsgs.length; i++) {
		var done = this.movingMsgs[i].update();
		if (done)
			doneMsgs.push([i,this.movingMsgs[i]]);
	}
	while (doneMsgs.length) {
		var indexAndMess = doneMsgs.pop();
		this.movingMsgs.splice(indexAndMess[0],1);
		indexAndMess[1].to.recieveMessage(indexAndMess[1]);
	}
}

MessageMgr.prototype.drawMsgs = function(context) {
	for(var i = 0; i < this.movingMsgs.length; i++) {
		this.movingMsgs[i].draw(context);
	}
}
