/**
 * Class to represent a node
 * x, y: the position in the canvas to display the node at
 * type: not yet implemented, just pass null for now or omit
 * id: you probably should pass null or omit this parameter, but if you have a good reason
		to force an id upon a node you can do it this way. nb that may cause collisions
 */
var Node = function(x, y, type, id, flavors) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.id = id || Node.GetNextId();
	this.drawable = new Rectangle(x-(constants.nodeSize/2), y-(constants.nodeSize/2), constants.nodeSize, constants.nodeSize, "Navy", true);
	this.isLeader = false;
	this.isRogue = false;
	
	
	// Acceptor fields
	this.highestSeen = -1; // store the highest proposal number you've seen
	this.acceptedMsg = null; // if you accept, store the message content
	this.highestInstance = -1;

	// Proposer fields
	this.proposedData = null; // store the data we're trying to push through
	this.highestProposal = 0; // highest proposal # ever used by this node
	this.currentInstance = 1; // the current instance (used for multipaxosing)
	this.promiseMsg = null; // if a promise has a payload, store it here
	this.promisesReceived = [];
	this.acceptsReceived = [];
	this.acReqSent = false; // has a bunch of accept requests been sent?
	this.clResSent = false; // has the client been informed?
	this.isSteadyStating= false; // if currently leading multipaxos in steady state.
	this.sentAccepts = [];
	this.isDone = false;
	this.highestCompetitorProp = -1;
	
	// Election fields
	this.sbReceived = 0;
	this.highIdSeen = -1;
	this.electionPhase = 0;
	this.broadcastsReceived = [];
	this.lpromisesReceived = [];
	
	if(flavors.indexOf("client") != -1) {
		this.drawable.color = "DarkRed";
		NodeMgr.getInstance().clientNode = this;
	} else {
		NodeMgr.getInstance().addNode(this, flavors);
	}
}
Node.NextId = 0;
Node.GetNextId = function() {
	return Node.NextId++;
}

Node.prototype.draw = function (context) {
	this.drawable.draw(context);

	// Write some text on the node
	var types = ""
	types += (NodeMgr.getInstance().getFlavoredNodes("proposer").contains(this) ? "P " : "  ");
	types += (NodeMgr.getInstance().getFlavoredNodes("acceptor").contains(this) ? "A " : "  ");
	types += (NodeMgr.getInstance().getFlavoredNodes("learner").contains(this) ? "L " : "  ");

	var textLines = ["ID: " + this.id + "  " + types];
	if(this.isLeader) {
		textLines = textLines.concat(["Proposed: " + (this.proposedData ? this.proposedData : null), 
										"Promises: " + this.promisesReceived.length, 
										"Accepts: " + this.acceptsReceived.length,
										"Prop/Iter: " + this.highestProposal +"/" + this.currentInstance,
										"Steady: " + (this.isSteadyStating ? "True" : "False")]);
	} else if(this !== NodeMgr.getInstance().clientNode) {
		textLines = textLines.concat(["Value: " + (this.acceptedMsg ? this.acceptedMsg.data : null), "Highest proposal: " + this.highestSeen]);
	}
	
	context.fillStyle = "MintCream";
	context.font="10px Arial";
	for(var i = 0, len = textLines.length; i < len; i++) {
		context.fillText(textLines[i], this.x - constants.nodeSize/2 + 3, this.y - constants.nodeSize/2 + 2 + (i+1)*10);
	}
}

Node.prototype.setLeader = function() {
	this.isLeader = true;
	this.isSteadyStating = false;
	this.highestProposal = this.highestSeen + 1;
	NodeMgr.getInstance().leaderNode = this;
	this.drawable.color = "ForestGreen";
}

Node.prototype.selfBroadcast = function() {
	var msg = { 'selfID': this.id };
	this.sendSharepoint(Message.Type.SELFBROADCAST, msg);
}

Node.prototype.receiveMessage = function(message) {
	if(this.isRogue){
		Logger.getInstance().log('Message not recieved: ' + message.toString(), -1);
		if (NodeMgr.getInstance().LeaderNode == this && this.electionPhase == 4) {
			Logger.getInstance().log('Leader faultered; rerunning elections.', 1);
			NodeMgr.getInstance().sendBroadcasts();
		}
		return;
	}

	Logger.getInstance().log('Message received: ' + message.toString(), -1);
	var nm = NodeMgr.getInstance();

	switch (message.type) {
		case Message.Type['SYSREQUEST']:
			if (this.isLeader) {
				// send prepare request to acceptors with ID n. save value to be updated. begin accumulating promise responses
				this.proposedData = message.content.data;
				this.promiseMsg = null; 
				this.promisesReceived = [];
				this.acceptsReceived = [];
				this.acReqSent = false; 
				this.clResSent = false; 
				this.sentAccepts = [];
				this.isDone = false;

				var propNum;
				if(this.isSteadyStating) { 
					propNum = this.highestProposal;
					this.currentInstance += 1;
				} else {
					propNum = randIntIn(this.highestProposal + 1, this.highestProposal + 4);
				}
				this.highestProposal = propNum;
				var acceptors = nm.getFlavoredNodes("acceptor");
				for (var i = 0, len = acceptors.length; i < len; i++) {
					var node = acceptors[i];
					if(!this.isSteadyStating) { 
						this.sendMessage(node, Message.Type['PREPARE'], { 'data': message.content.data, 'proposalNumber':propNum, 
								'instanceNumber':this.currentInstance});
					}else{
						this.sendMessage(node, Message.Type['ACCEPT_REQUEST'], { 'data': message.content.data, 'proposalNumber':propNum, 
								'instanceNumber':this.currentInstance});
					}
				}
			}
			break;
		case Message.Type['PREPARE']:
			// if acceptor, send leader a promise to only accept proposals >= n. update highest value. else ignore (or send nonacknowledgement for optimization?
			if (!this.highestSeen || this.highestSeen < message.content.proposalNumber) {
				this.highestSeen = message.content.proposalNumber;
				this.highestInstance = -1;
				this.favoriteProposal = message.content;
				this.sendMessage(message.from, Message.Type['PROMISE'], this.favoriteProposal);
			} else {
				//old prop / send nack
				this.sendMessage(message.from, Message.Type['PROMISE'], this.favoriteProposal);
			}
			break;
		case Message.Type['PROMISE']:
			// if leader, accumulate responses. if a majority has been reached, send accept request with the proposal number and value, and start accumulating accept responses
			if (this.isLeader) {
				if (message.content.proposalNumber > this.highestProposal) {
					// the acceptor sending this has seen a higher proposal number
					this.highestCompetitorProp = message.content.proposalNumber;
					this.highestProposal = this.highestCompetitorProp + randIntIn(1, 4);
					this.sendMessage(message.from, Message.Type['PREPARE'], { 'data': this.proposedData, 'proposalNumber':this.highestProposal, 
								'instanceNumber':this.currentInstance});
					this.isSteadyStating = false;
					// TODO: add code to handle dueling leaders.
				} else if(message.content.proposalNumber <= this.highestProposal) {
						if (this.isSteadyStating) {
							// TODO: this really shouldn't happen, so i don't know. maybe send an accept request?
						} else {
						this.promisesReceived.push(message.from);
						if (!this.isDone && this.promisesReceived.length >= NodeMgr.getInstance().quorum) {
							// Quorum of promises
							if (!this.acReqSent) { 
								Logger.getInstance().log('Node ' + this.id + ' has achieved a quorum of promises.  Sending ACCEPT_REQUEST messages now...');
								this.acReqSent = true;
							}
							var content = this.promiseMsg || {'data':this.proposedData, 'proposalNumber':this.highestProposal, 'instanceNumber':this.currentInstance};
							var acceptors = nm.getFlavoredNodes("acceptor");
							for (var i = 0, len = acceptors.length; i < len; i++) {
								var node = acceptors[i];
								if (!(this.sentAccepts.contains(node))) {
									this.sendMessage(node, Message.Type['ACCEPT_REQUEST'], content);
									this.sentAccepts.push(node);
								}
							}
						}
					}
				}
			}
			break;
		case Message.Type['ACCEPT_REQUEST']:



			// if acceptor, if proposal number >= highestProposal, send accept message to leader and learners and save the value (permanently or not?)
			if (this.highestSeen < message.content.proposalNumber ||
						this.highestSeen == message.content.proposalNumber && this.highestInstance < message.content.instanceNumber) {
				this.acceptedMsg = message.content;
				this.highestSeen = message.content.proposalNumber;
				this.highestInstance = message.content.instanceNumber;
				// inform the learners
				var learners = nm.getFlavoredNodes("learner");
				for (var i = 0, len = learners.length; i < len; i++) {
					var node = learners[i];
					if (node.id != this.id) {
						this.sendMessage(node, Message.Type['ACCEPT'], message.content);
					}
				}
				// inform the proposer in case he isn't a learner
				if(!nm.getFlavoredNodes("learner").contains(message.from))
					this.sendMessage(message.from, Message.Type['ACCEPT'], message.content);
			} else { 
				// isn't the highest seen
			}
			break;
		case Message.Type['ACCEPT']:
			// if leader, accumulate response
			// if learner, accumulate responses. if a majority has been reached, make the value permanent and send SYSRESPONSE to client
			if (this.isLeader) {
				if (message.content.proposalNumber == this.highestProposal && message.content.instanceNumber == this.currentInstance){
					this.acceptsReceived.push(message.from)
					if (!this.isDone && this.acceptsReceived.length >= NodeMgr.getInstance().quorum) {
							// Quorum of accepts
						if (!this.clResSent) { 
							Logger.getInstance().log('Node ' + this.id + ' has achieved a quorum of accepts.  Sending SYSRESPONSE messages now...');
							this.clResSent = true;
							this.sendMessage(NodeMgr.getInstance().clientNode, Message.Type['SYSRESPONSE'], message.content);	
							this.isDone = true;
						}
						this.isSteadyStating = true;
					}
				}
			} else {
				if (message.content.proposalNumber >= this.highestProposal && message.content.instanceNumber >= this.highestInstance){
					/// TODO: double check that it's accepting the right thing / counting the right thing
					this.acceptsReceived.push(message.from);
					if (!this.clResSent && this.acceptsReceived.length >= NodeMgr.getInstance().quorum) {
						// Quorum of accepts
						if (!this.clResSent) { 
							Logger.getInstance().log('Node ' + this.id + ' has achieved a quorum of accepts.  Sending SYSRESPONSE messages now...');
							this.sendMessage(this, Message.Type['SYSRESPONSE'], message.content);
							this.clResSent = true;
						}
					}
				}
			}
			break;
		case Message.Type['SYSRESPONSE']:
			if (this === NodeMgr.getInstance().clientNode) {
				// should only be used to send to client
				Logger.getInstance().log('Paxos complete.  The value has been determined to be ' + message.content.data + '.', 1);
			} else {
				Logger.getInstance().log('Node' + this.id + ' has agreed that the value is ' + message.content.data + '.', 0);
			}
			break;
		case Message.Type['SELFBROADCAST']:
			// Add to tally
			// If tally is > n/2 and still in first phase, send out HIGHBROADCAST using the highest ID seen and move to 2nd phase
			if (this.electionPhase >= 3)
				break;			
			if (message.content.selfID > this.highIdSeen)
				this.highIdSeen = message.content.selfID;
			this.sbReceived++;
			if (this.sbReceived >= NodeMgr.getInstance().quorum) {
				var msg = { 'selfID': this.id, 'highID': this.highIdSeen };
				this.sendSharepoint(Message.Type.HIGHBROADCAST, msg);
			}
			this.electionPhase = 2;
			break;
		case Message.Type['HIGHBROADCAST']:
			// Add to list of (ID, HID)
			// Update highest ID if needed
			// If > n/2 responses and still in 2nd phase, send out HIGHPROMISE using new HID and move to 3rd phase
			// (What if HID is not agreed upon by the majority?)
			if (this.electionPhase >= 3)
				break;
			var from = message.content.selfID;
			var high = message.content.highID;
			this.broadcastsReceived[from] = high;
			var agr = commonValue(this.broadcastsReceived);
			if (agr && agr >= 0) {
				Logger.getInstance().log('Node ' + this.id + ' has received HIGHBROADCASTS from a majority of nodes vouching for ' + agr);
				this.sendSharepoint(Message.Type.HIGHPROMISE, { 'selfID' : this.id, 'highID': agr});
				this.electionPhase = 3;
			}
			break;
		case Message.Type['HIGHPROMISE']:
			// Add to list of (ID, HID) promises
			// if > n/2 have promised to the same HID, set HID as elected leader and if self is not HID, remove 'proposer' from self's flavors.
			if (this.electionPhase >= 4)
				break;
			var from = message.content.selfID;
			var high = message.content.highID;
			this.lpromisesReceived[from] = high;
			var agr = commonValue(this.lpromisesReceived);
			if (agr && agr >= 0) {
				Logger.getInstance().log('Node ' + this.id + ' has received HIGHPROMISES from a majority of nodes vouching for ' + agr, 1);
				NodeMgr.getInstance().leader = agr;
				//if (agr != this.id)
				//	this.flavors = removeA(this.flavors, 'proposer');
				//else
				if(agr == this.id){
					this.setLeader();
				} else {
					this.definitelyAintLeader()
				}
				this.electionPhase = 4;
			}
			break;
		default:
			Logger.getInstance().log('ERROR: Unknown message type received...');
			break;
	
	this.draw(CanvasMgr.getInstance().context2d);
}

/*
	do {
		var randRecip1 = nm.nodes[randIntUnder(nm.nodes.length)];
		var randRecip2 = nm.nodes[randIntUnder(nm.nodes.length)];
	} while (randRecip1 == this || randRecip2 == this || randRecip1 == randRecip2);

	this.sendMessage(randRecip1, message.type, message.content);
	this.sendMessage(randRecip2, message.type, message.content);
*/
}

Node.prototype.sendSharepoint = function(type, content) {
	if (!this.isRogue){
		var allNodes = NodeMgr.getInstance().getAllNodes();
		for (var i = 0, len = allNodes.length; i < len; i++) {
			var node = allNodes[i];
			if (node.id != this.id) {
				this.sendMessage(node, type, content);
			}	
		}
	}
}

Node.prototype.sendMessage = function(to, type, content) {
	var message = new Message(this, to, type, content);
	message.send();
}

Node.prototype.initiateElection = function() {
	if (!this.isRogue) {
		this.sbReceived = 0;
		this.highIdSeen = -1;
		this.electionPhase = 0;
		this.broadcastsReceived = [];
		this.lpromisesReceived = [];
		for (var j = 0; j < NodeMgr.getInstance().getAllNodes().length; j++) {
			this.broadcastsReceived.push(-1);
		}
		this.selfBroadcast();	
	}
}

Node.prototype.switchRogue = function() {
	this.isRogue = !this.isRogue;
	if (this.isRogue) {
		if (NodeMgr.getInstance().leaderNode == this) {
			NodeMgr.getInstance().sendBroadcasts();
		}
		this.oldDrawableColor = this.drawable.color;
		this.drawable.color = "darkGrey";
	} else {
		this.drawable.color = this.oldDrawableColor;
		for (var i = 0; i < NodeMgr.getInstance().getAllNodes().length; i++)
			NodeMgr.getInstance().getAllNodes()[i].informNodeBackUp(this);
		
	}
}

Node.prototype.informNodeBackUp = function(upNode) {
	if (!this.isRogue){
		if (this.isLeader && !!(this.proposedData)) {
			if (this.isSteadyStating || this.promisesReceived.length >= NodeMgr.getInstance().quorum ){
				this.sendMessage(upNode, Message.Type['ACCEPT_REQUEST'], {data:this.proposedData, 
					proposalNumber:this.highestProposal, 
					instanceNumber:this.currentInstance});
			} else {
				this.sendMessage(upNode, Message.Type['PREPARE'], {data:this.proposedData, 
					proposalNumber:this.highestProposal, 
					instanceNumber:this.currentInstance});
			}
		}
	}
}

Node.prototype.containsPoint = function(x, y) {
	return (Math.abs(x - this.x) < constants.nodeSize && Math.abs(y - this.y) < constants.nodeSize)
}

Node.prototype.definitelyAintLeader = function() {
	this.drawable.color = "Navy";
	this.isLeader = false;
}