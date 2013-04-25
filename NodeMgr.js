/**
 * Singleton class to manage nodes n stuff
 */

var NodeMgr = function() {
	this.nodes = new Array();
}
NodeMgr.instance = null;
NodeMgr.getInstance = function() {
	if (!NodeMgr.instance) {
		NodeMgr.instance = new NodeMgr();
	}
	return NodeMgr.instance;
}

NodeMgr.prototype.drawNodes = function (context) {
	for(var i = 0; i < this.nodes.length; i++) {
		this.nodes[i].draw(context);
	}
}
