/**
 * Singleton class to manage nodes n stuff
 */

var NodeMgr = function() {
	this.nodess = new Array();
	this.nodeFlavors = new Array();
}
NodeMgr.instance = null;
NodeMgr.getInstance = function() {
	if (!NodeMgr.instance) {
		NodeMgr.instance = new NodeMgr();
	}
	return NodeMgr.instance;
}

NodeMgr.prototype.addNode = function(node, listOfFlavors) {
	this.nodess.push(node);
	for(var i = 0; i < listOfFlavors.length; i++) {
		if(!this.nodeFlavors.hasOwnProperty(listOfFlavors[i])) {
			this.nodeFlavors[listOfFlavors[i]] = new Array();
		}
		this.nodeFlavors[listOfFlavors[i]].push(node);
	}
}

NodeMgr.prototype.getFlavoredNodes = function(flavor) {
	return this.nodeFlavors[flavor];
}

NodeMgr.prototype.getAllNodes = function() {
	return this.nodess;
}


NodeMgr.prototype.drawNodes = function (context) {
	for(var i = 0; i < this.nodess.length; i++) {
		this.nodess[i].draw(context);
	}
}
