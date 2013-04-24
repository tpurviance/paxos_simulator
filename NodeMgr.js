			var NodeMgr = function() {
				this.nodes = new Array();
			}

			NodeMgr.prototype.drawNodes = function (context) {
				for(var i = 0; i < this.nodes.length; i++) {
					this.nodes[i].draw(context);
				}
			}
