var NodeMgr = function() {
	this.nodes = new Array();
}

NodeMgr.prototype.createNode = function(x, y, type, id) {
	var node = new Node(x, y, null, null);
	this.nodes.push(node);
	return node;
}

NodeMgr.prototype.drawNodes = function (context) {
	for(var i = 0; i < this.nodes.length; i++) {
		this.nodes[i].draw(context);
	}
}
