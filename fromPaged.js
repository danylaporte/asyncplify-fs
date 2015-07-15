var Asyncplify = require('asyncplify');
var debug = require('debug')('asyncplify-fs:fromPaged');
var fs = require('fs');

function FromPaged(options, sink) {
	var self = this;

	this.autoDelete = options && options.autoDelete;
	this.filenames = (options && options.filenames || options || []).concat();
	this.handlePageLoaded = function (err, data) { self.pageLoaded(err, data); };
	this.index = 0;
	this.items = [];
	this.sink = sink;
	this.sink.source = this;
	this.state = Asyncplify.states.RUNNING;

	debug('%d page(s) to load', this.filenames.length);

	if (this.filenames.length)
		this.load();
	else
		this.sink.end(null);
}

FromPaged.prototype = {
	emitItems: function () {
		while (this.index < this.items.length && this.state === Asyncplify.states.RUNNING) {
			this.sink.emit(this.items[this.index++]);
		}

		if (this.state === Asyncplify.states.RUNNING) {
			if (this.filenames.length) {
				this.load();
			} else {
				this.state = Asyncplify.states.CLOSED;
				this.sink.end(null);
			}
		}
	},
	load: function () {
        debug('loading page %d', this.count++);
		fs.readFile(this.filenames[0], this.handlePageLoaded);
	},
	pageLoaded: function (err, data) {
		if (this.state === Asyncplify.states.CLOSED) return;

		var filename = this.filenames.shift();

		if (this.autoDelete && filename) fs.unlink(filename);

		if (!err && this.sink) {
			try {
				this.items = JSON.parse(data);
			} catch (ex) {
				err = ex;
			}

			if (!err) {
				this.index = 0;
				debug('page %d loaded containing %d item(s)', this.count - 1, this.items.length);
				this.emitItems();
			}
        }

		if (err) {
			this.state = Asyncplify.states.CLOSED;
			this.items.length = 0;
			this.sink.end(err);
		}
	},
	setState: function (state) {
		if (this.state !== state && this.state !== Asyncplify.states.CLOSED) {
			this.state = state;
			this.emitItems();
		}
	}
};

module.exports = FromPaged;