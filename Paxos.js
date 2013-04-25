var Paxos = function() {
	Paxos.instance = this;
}
Paxos.instance = null;
		
Paxos.prototype.Go = function() {
	Paxos.FUCKUTAYLOR = new MessageMgr();
	this.cm = new CanvasMgr(document.getElementById('canvas'), window.screen.availWidth, window.screen.availHeight, 1000);
	this.nodeMgr = new NodeMgr();
	
	Paxos.RIGBY = this.cm;
	Paxos.MORDECAI = this.nodeMgr;
	
	this.ui = {};
	this.ui.numnodes = {};
	this.ui.numnodes.input = document.getElementById('numnodes');
	this.ui.numnodes.submit = document.getElementById('numnodes_update');
	this.ui.numnodes.submit.onclick = this.Reboot;
	
	for (var i = 0, len = this.ui.numnodes.input.value; i < len; i++) {
		this.nodeMgr.createNode(100 + randIntUnder(1020), 100 + randIntUnder(420), null, null);
	}

	var n1 = this.nodeMgr.nodes[0];
	n1.setLeader();
	var n2 = this.nodeMgr.nodes[1];
	n1.sendMessage(n2, "asdf", "fdsa");
				

	Paxos.animateLoop();
}

Paxos.prototype.Reboot = function() {
	Paxos.instance.Go();
}
			
/**
 * Helper function, keeps the animation going
 */
Paxos.animateLoop = function() {
	var timestart = Date.now();
	//canvasClick();
	Paxos.FUCKUTAYLOR.updateMsgs();
	Paxos.RIGBY.drawCanvas();
	var timeleft = this.waitTime - (Date.now() - timestart);
	timeleft = Math.min(5,timeleft);
	Paxos.RIGBY.frameTime = timestart - Paxos.RIGBY.lastFrame ;
	Paxos.RIGBY.lastFrame = timestart;
	setTimeout(Paxos.animateLoop, timeleft);
};