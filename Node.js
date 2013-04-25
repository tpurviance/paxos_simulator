var Node = function(x, y, type, id) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.id = id || Node.GetNextId();
	this.drawable = new Rectangle(x-50, y-50, 100, 100, "rgb(0,0,128)", true);
	this.isLeader = false;
	this.highestProposal = 0;
	
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
			// if acceptor, send leader a promise to only accept proposals >= n. update highest value. else ignore (or send nonacknowledgement for optimization?
			break;
		case Message.Type['SYSREQUEST']:
			if (this.isLeader) {
				// send prepare request to acceptors with ID n. save value to be updated. begin accumulating promise responses
			}
			break;
		case Message.Type['PROMISE']:
			// if leader, accumulate responses. if a majority has been reached, send accept request with the proposal number and value, and start accumulating accept responses
			break;
		case Message.Type['ACCEPT_REQUEST']:
			// if acceptor, if proposal number >= highestProposal, send accept message to leader and learners and save the value (permanently or not?)
			break;
		case Message.Type['ACCEPT']:
			// if leader, accumulate response
			// if learner, accumulate responses. if a majority has been reached, make the value permanent and send SYSRESPONSE to client
			break;
		case Message.Type['SYSRESPONSE']:
			// should only be used to send to client
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

Node.prototype.sendMessage = function(to, type, content) {
	var message = new Message(this, to, type, content);
	message.send();
}
