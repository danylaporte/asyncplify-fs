var asyncplify = require('asyncplify');
var fs = require('fs');

function Watch(options, on) {
	this.listener = this.listener.bind(this);
	this.on = on;
	this.state = asyncplify.PAUSED;
	this.source = null;
	this.setState(asyncplify.RUNNING);
}

Watch.prototype = {
	listener: function (event, path) {
		this.on.emit({ event: event, path: path });
	},
	setState: function (state) {
		if (this.state !== state && this.state !== asyncplify.CLOSED) {
			this.state = state;

			if (state === asyncplify.RUNNING) {
				this.source = fs.watch(this.options.path, this.options, this.listener);
			} else if (this.source) {
				this.source.close();
				this.source = null;
			}
		}
	}
};