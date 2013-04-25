/**
 * Singleton class
 * Manages all the messages going back and forth
 */
var MessageMgr = function() {
	this.movingMsgs = new Array();
}
MessageMgr.instance = null;
MessageMgr.getInstance = function() {
	if (!MessageMgr.instance) {
		MessageMgr.instance = new MessageMgr();
	}
	return MessageMgr.instance;
}

/** Check active messages - if they're done, play the AOL "you've got mail!" sound
 *	on the recipient's computer */
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
		indexAndMess[1].to.receiveMessage(indexAndMess[1]);
	}
}

/** TODO: The message mgr shouldn't be responsible for drawing the messages */
MessageMgr.prototype.drawMsgs = function(context) {
	for(var i = 0; i < this.movingMsgs.length; i++) {
		this.movingMsgs[i].draw(context);
	}
}