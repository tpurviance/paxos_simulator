/**
 * Message class
 * From and To should be IDs (Node.id property)
 * Type should be from the Message.Type enum
 * Content should be a JSON serialization of any necessary information
 * 	FIELDS TO USE FOR SERIALIZATION: data, proposalNumber
 */
var Message = function(from, to, type, content) {
	this.from = from;
	this.to = to;
	this.type = type;
	this.content = content;

	var color;
	switch (this.type) {
		case Message.Type['PREPARE']:
			color = "rgb(200, 50, 50)";
			break;
		case Message.Type['SYSREQUEST']:
			color = "rgb(50, 200, 50)";
			break;
		case Message.Type['PROMISE']:
			color = "rgb(50, 50, 200)";
			break;
		case Message.Type['ACCEPT_REQUEST']:
			color = "rgb(200, 200, 50)";
			break;
		case Message.Type['ACCEPT']:
			color = "rgb(200, 50, 200)";
			break;
		case Message.Type['SYSRESPONSE']:
			color = "rgb(50, 200, 200)";
			break;
		default:
			color = "rgb(200, 200, 200)";
			break;
	}
	
	this.drawable = new Rectangle(from.x, from.y, 20, 20, color, true);
}

/**
 * All messages should be one of these types
 */
Message.Type = {
					'SYSREQUEST'	: 0, // An external request to propagate some information. Sent to propsers
					'PREPARE'		: 1, // A message from a proposer to acceptors
					'PROMISE'		: 2, // A message from acceptors to proposers
					'ACCEPT_REQUEST': 3, // Sent from proposor to acceptors once it has enough promises
					'ACCEPT'		: 4, // Sometimes sent in response to an accept request 
					'SYSRESPONSE'	: 5, // Sent from a proposer to the external system once it receives enough "accepted" messages
				};

Message.prototype.send = function() {
	MessageMgr.getInstance().movingMsgs.push(this);
}

Message.prototype.draw = function(context) {
	this.drawable.draw(context);
}

Message.prototype.update = function() {
	var dx = sign(this.to.x - this.drawable.x);
	var dy = sign(this.to.y - this.drawable.y);

	this.drawable.move(dx,dy);

	if (dx == 0 && dy == 0) 
		return true;
	else
		return false;
}

Message.prototype.toString = function() {
	return 'From: ' + this.from.id + '; To: ' + this.to.id + '; Type: ' + getKeyFromValue(Message.Type, this.type) + '; Content: ' + dumbStringify(this.content) + ';';
}