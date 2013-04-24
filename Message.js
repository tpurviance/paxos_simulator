			var Message = function(from, to, type, content) {
				this.from = from;
				this.to = to;
				this.type = type;
				this.content = content;
				this.drawable = new Rectangle(from.x, from.y, 20, 20, "rgb(200,0,0)", true);
			}

			Message.prototype.send = function() {
				msgMgr.movingMsgs.push(this);
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
