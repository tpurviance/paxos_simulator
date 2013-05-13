/**
 * Singleton class which drives the algorithm-
 */ 
var Paxos = function() {
}
Paxos.instance = null;
Paxos.getInstance = function() {
	if (!Paxos.instance) {
		Paxos.instance = new Paxos();
	}
	return Paxos.instance;
}

/**
 * Actually start
 */ 
Paxos.prototype.go = function() {
	this.paused = true;
	this.ui = {};
	this.ui.numnodes = {};
	this.ui.numnodes.input = document.getElementById('numnodes');
	this.ui.numnodes.submit = document.getElementById('numnodes_update');
	this.ui.numnodes.submit.onclick = this.reboot;
	
	this.ui.updateval = {};
	this.ui.updateval.input = document.getElementById('update_text');
	this.ui.updateval.submit = document.getElementById('submit_update');
	this.ui.updateval.submit.onclick = function(e) { Paxos.getInstance().submitUpdate(Paxos.getInstance().ui.updateval.input.value); };
	
	this.ui.quorumval = {};
	this.ui.quorumval = document.getElementById('quorum_text');
	
	this.ui.pause = document.getElementById('pause');
	this.ui.pause.onclick = this.pause;
	
	var rows = 3;
	var npr = Math.ceil(this.ui.numnodes.input.value / rows);
	
	// Place the client node in the first column, middle row
	new Node(constants.canvasMargin, constants.canvasMargin + 180 * Math.floor(1 / npr), null, null, ["client"]);
	
	// Place the rest of the nodes in the rest of the columns
	for (var i = 0, len = this.ui.numnodes.input.value; i < len; i++) {
		var x = constants.canvasMargin + Math.floor((CanvasMgr.getInstance().canvas.width - 2*constants.canvasMargin) / npr) * ((i % npr) + 1);
		var y  = constants.canvasMargin + 180 * Math.floor(i / npr);
		new Node(x, y, null, null, ["proposer","acceptor","learner"]);
	}
	
	NodeMgr.getInstance().quorum = this.ui.quorumval.value;
	
	//var n1 = NodeMgr.getInstance().nodess[0];
	//n1.setLeader();
	
	NodeMgr.getInstance().sendBroadcasts();
	
	//this.submitUpdate('e0ad33b7');

	this.timeoutInterval = window.setInterval(this.animateLoop, 3);
}

Paxos.prototype.submitUpdate = function(value) {
	NodeMgr.getInstance().resetNodeState();
	var leader = NodeMgr.getInstance().leaderNode;
	var cli = NodeMgr.getInstance().clientNode;
	Logger.getInstance().log('Sending SYSREQUEST to Node #' + leader.id + ' with data ' + value, 1);
	cli.sendMessage(leader, Message.Type['SYSREQUEST'], { 'data': value });
}

/**
 * This is a quick and dirty way of learning the value which has been chosen 
 * --- until we implement learners properly, this will function as an ad-hoc learner node
 */
Paxos.prototype.learn = function(value) {

}

// TODO: Better memory management with this function
Paxos.prototype.reboot = function() {
	Logger.getInstance().log('Restarting simulation...');
	
	if (Paxos.getInstance().ui.numnodes.input.value < 3)
		Paxos.getInstance().ui.numnodes.input.value = 3;
	
	window.clearInterval(Paxos.instance.timeoutInterval);
	Paxos.instance = null;
	CanvasMgr.instance = null;
	NodeMgr.instance = null;
	MessageMgr.instance = null;
	Node.NextId = 0;

	Paxos.getInstance().go();
}

// TODO: a better way to do this would be to clear the timeout, but w/e
Paxos.prototype.pause = function() {
	var inst = Paxos.getInstance();
	if (inst.paused) {
		if (inst.ui.pause.value == 'Begin Simulation')
			Logger.getInstance().log('Simulation started - beginning leader election now');
		else
			Logger.getInstance().log('Simulation unpaused');
		inst.ui.pause.value = 'Pause Simulation';
	} else {
		inst.ui.pause.value = 'Unpause Simulation';
		Logger.getInstance().log('Simulation paused');
	}
	inst.paused = !inst.paused;
}
			
/**
 * Helper function, keeps the animation going
 */
Paxos.prototype.animateLoop = function() {
	var inst = Paxos.getInstance();
	if (!inst.paused) {
		var timestart = Date.now();
		//canvasClick();
		MessageMgr.getInstance().updateMsgs();
		CanvasMgr.getInstance().drawCanvas();
		//var timeleft = (inst.waitTime - (Date.now() - timestart)) || 0;
		//timeleft = Math.max(7,timeleft);
		//var timeleft = 1000 / 6000;
		CanvasMgr.getInstance().frameTime = (timestart - CanvasMgr.getInstance().lastFrame) || 1 ;
		CanvasMgr.getInstance().lastFrame = timestart;
	}
};