var Asyncplify = require('asyncplify');
var debug = require('debug')('asyncplify-fs:fromPaged');
var fs = require('fs');
var states = Asyncplify.states;

function FromPaged(options, on) {
	var self = this;

	this.autoDelete = options && options.autoDelete;
	this.error = null;
	this.fileIndex = 0;
	this.filenames = options && options.filenames || options;
	this.handlePageLoaded = function (err, data) { self.pageLoaded(err, data); };
	this.index = 0;
	this.items = [];
	this.loading = false;
	this.on = on;
	this.state = states.RUNNING;

	on.source = this;
    
    debug('%d page(s) to load', this.filenames.length);
    this.do();
}

FromPaged.prototype = {
	dispose: function () {
		if (this.autoDelete) {
            var count = 0;
			for (; this.fileIndex < this.filenames.length; this.fileIndex++) {
				try {
					fs.unlinkSync(this.filenames[this.fileIndex]);
                    count++;
				} catch (ex) {
				}
			}
            if (count) debug('delete %d pages.', count);
		}
	},
	do: function () {
		while (this.index < this.items.length && this.state === states.RUNNING) {
			this.on.emit(this.items[this.index++]);
		}

		if (this.state === states.RUNNING) {
			var isCompleted = !this.loading && this.fileIndex === this.filenames.length;

			if (this.error || isCompleted) {
				this.state = states.CLOSED;
				this.dispose();
				this.on.end(this.error);
			} else if (!this.loading) {
				this.load();
			}
		}
	},
	load: function () {
		this.loading = true;
		this.index = 0;
		this.items.length = 0;
        debug('page %d/%d loading', this.fileIndex, this.filenames.length);
		fs.readFile(this.filenames[this.fileIndex++], this.handlePageLoaded);
	},
	pageLoaded: function (err, data) {
		this.error = err;
		this.loading = false;

		if (this.autoDelete) fs.unlink(this.filenames[this.fileIndex - 1]);

		if (!err) {
            this.items = JSON.parse(data);
            debug('page %d/%d loaded containing %d item(s)', this.fileIndex, this.filenames.length, this.items.length);
        }
        
		if (this.state === states.RUNNING) this.do();
	},
	setState: function (state) {
		if (this.state !== state && this.state !== states.CLOSED) {
			this.state = state;

			if (state === states.CLOSED) this.dispose();
			else if (state === states.RUNNING) this.do();
		}
	}
};

module.exports = FromPaged;