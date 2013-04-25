var Node = function(x, y, type, id) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.id = id || Node.GetNextId();
	this.drawable = new Rectangle(x-50, y-50, 100, 100, "rgb(0,0,128)", true);
	this.isLeader = false;
	
	this.database = {};
	this.unresolved = {};
}

Node.NextId = 0;
Node.GetNextId = function() {
	return Node.NextId++;
}

Node.prototype.draw = function (context) {
	this.drawable.draw(context);
}

Node.prototype.setLeader = function() {
	this.isLeader = true;
	this.drawable.color = "rgb(0,128,0)";
}

// check message type
// 
Node.prototype.receiveMessage = function(message) {

	switch (message.type) {
		case Message.Type['PREPARE']:
			break;
		case Message.Type['REQUEST']:
			if (this.isLeader) {
				this.handleTheThing(); // no not that thing you pervert
			}
			break;
		case Message.Type['PROMISE']:
			break;
		case Message.Type['ACCEPT_REQUEST']:
			break;
		case Message.Type['ACCEPT']:
			break;
		case Message.Type['RESPONSE']:
			break;
		default:
			alert('awerawlerjaw;lkerjawl;kerjawel;kjr');
			break;
	}
	
	do {
		var randRecip1 = Paxos.MORDECAI.nodes[randIntUnder(Paxos.MORDECAI.nodes.length)];
		var randRecip2 = Paxos.MORDECAI.nodes[randIntUnder(Paxos.MORDECAI.nodes.length)];
	} while (randRecip1 == this || randRecip2 == this || randRecip1 == randRecip2);

	this.sendMessage(randRecip1, message.type, message.content);
	this.sendMessage(randRecip2, message.type, message.content);
}

Node.prototype.handleTheThing = function() {

}

Node.prototype.sendMessage = function(to, type, content) {
	var message = new Message(this, to, type, content);
	message.send();
}
