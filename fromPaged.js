var Asyncplify = require('asyncplify');
var debug = require('debug')('asyncplify-fs:fromPaged');
var fs = require('fs');

function FromPaged(options, sink) {
	var self = this;

	this.autoDelete = options && options.autoDelete;
	this.filenames = (options && options.filenames || options || []).concat();
	this.handlePageLoaded = function (err, data) { self.pageLoaded(err, data); };
	this.pageCount = 0;
	this.sink = sink;
	this.sink.source = this;
	
	debug('%d page(s) to load', this.filenames.length);

	if (this.filenames.length)
		this.load();
	else
		this.sink.end(null);
}

FromPaged.prototype = {
	close: function () {
		this.sink = null;

		if (this.autoDelete) {
            var count = 0;
			for (var i = 0; i < this.filenames.length; i++) {
				try {
					fs.unlinkSync(this.filenames[this.fileIndex]);
                    count++;
				} catch (ex) {
				}
			}
			this.filenames.length = 0;
            if (count) debug('delete %d pages.', count);
		}
	},
	load: function () {
        debug('loading page %d', this.count++);
		fs.readFile(this.filenames[0], this.handlePageLoaded);
	},
	pageLoaded: function (err, data) {
		var filename = this.filenames.shift();

		if (this.autoDelete && filename) fs.unlink(filename);
		
		if (!err && this.sink) {
            var items = JSON.parse(data);
            debug('page %d loaded containing %d item(s)', this.count-1, items.length);

			for (var i = 0; i < items.length && this.sink; i++)
				this.sink.emit(items[i]);
        }
		
		if (err || !this.filenames.length) {
			var sink = this.sink;
			this.close();
			sink.end(err);
		} else if (this.sink) {
			this.load();
		}
	}
};

module.exports = FromPaged;