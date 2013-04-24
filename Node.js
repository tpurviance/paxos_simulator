			var Node = function(x, y, type, ip) {
				this.x = x;
				this.y = y;
				this.type = type;
				this.ip = ip;
				this.drawable = new Rectangle(x-50, y-50, 100, 100, "rgb(0,0,128)", true);
				nodeMgr.nodes.push(this);
			}
			
			Node.prototype.draw = function (context) {
				this.drawable.draw(context);
			}

			// OMG taylor
			// i before e except after c
			// dumbass
			Node.prototype.recieveMessage = function(message) {

				do {
					var randRecip1 = nodeMgr.nodes[randIntUnder(nodeMgr.nodes.length)];
					var randRecip2 = nodeMgr.nodes[randIntUnder(nodeMgr.nodes.length)];
				} while (randRecip1 == this || randRecip2 == this || randRecip1 == randRecip2);

				this.sendMessage(randRecip1, message.type, message.content);
				this.sendMessage(randRecip2, message.type, message.content);
			}

			Node.prototype.sendMessage = function(to, type, content) {
				var message = new Message(this, to, type, content);
				message.send();
			}
