/**
 * Singleton log class
 */
var Logger = function() {
	this.logDiv = document.getElementById('log');
}
Logger.instance = null;
Logger.getInstance = function() {
	if (!Logger.instance) {
		Logger.instance = new Logger();
	}
	return Logger.instance;
}

/**
 * im = 0 or not set	=> somewhat important
 * im = -1				=> unimportant (not yet implemented)
 * im = 1				=> important
 */
Logger.prototype.log = function(msg, im) {
	im = im || 0;
	var p = document.createElement('p');
	p.textContent = msg;
	if (im == 1)
		p.className = 'bold';
	this.logDiv.appendChild(p);
	this.logDiv.scrollTop = this.logDiv.scrollHeight;
}