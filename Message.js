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
		case Message.Type['REQUEST']:
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
		case Message.Type['RESPONSE']:
			color = "rgb(50, 200, 200)";
			break;
		default:
			color = "rgb(200, 200, 200)";
			break;
	}
	
	this.drawable = new Rectangle(from.x, from.y, 20, 20, color, true);
}

Message.Type = {
					'PREPARE'		: 0,
					'REQUEST'		: 1,
					'PROMISE'		: 2,
					'ACCEPT_REQUEST': 3,
					'ACCEPT'		: 4,
					'RESPONSE'		: 5,
				};

Message.prototype.send = function() {
	Paxos.FUCKUTAYLOR.movingMsgs.push(this);
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