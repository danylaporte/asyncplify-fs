var Asyncplify = require('asyncplify');
var debug = require('debug')('asyncplify-fs:toPaged');
var fs = require('fs');
var temp = require('temp');

function noop() { }

function ToPaged(options, sink, source) {
	this.items = [];
	this.beforeSaving = options && options.beforeSaving || noop;
	this.savingQueue = options.savingQueue;
	this.sink = sink;
	this.sink.source = this;
	this.size = options && options.size || 10000;
	this.source = null;

	source._subscribe(this);
}

ToPaged.prototype = {
	dispose: function () {
		for (var i = 0; i < this.savingQueue.length; i++) {
			try {
				fs.unlinkSync(this.savingQueue[i].filename);
			} catch (ex) {
			}
		}

		this.savingQueue.length = 0;
	},
	emit: function (value) {
		this.items.push(value);

		if (this.items.length === this.size && this.items.length)
			this.savePage();
	},
	end: function (err) {
		this.source = null;

		if (err) {
			this.dispose();
			this.items.length = 0;
		} else if (this.items.length && this.sink) {
			this.savePage();
		}

		if (this.sink && (err || !this.savingQueue.length)) {
			this.sink.end(err);
			this.sink = null;
		}
	},
	pageSaved: function (err, savingItem) {
		if (err)
			debug('error saving page %s', err);
		else
			debug('page saved');

		savingItem.saved = true;

		if (err || !this.sink) {
			fs.unlink(savingItem.filename);

			if (this.source) this.source.setState(Asyncplify.states.CLOSED);
			this.source = null;

			if (this.sink) this.sink.end(err);
			this.sink = null;
		} else {
			while (this.savingQueue.length && this.savingQueue[0].saved && this.sink)
				this.sink.emit(this.savingQueue.shift().filename);

			if (!this.source && !this.savingQueue.length && this.sink) {
				this.sink.end(null);
				this.sink = null;
			}
		}
	},
	savePage: function () {
		debug('saving a page of %d items', this.items.length);

		var args = { filename: temp.path(), items: this.items };
		var self = this;
		var savingItem = { filename: args.filename, saved: false };

		this.beforeSaving(args);
		this.savingQueue.push(savingItem);

		fs.writeFile(args.filename, JSON.stringify(args.items), function (err) {
			self.pageSaved(err, savingItem);
		});

		this.items.length = 0;
	},
	setState: function (state) {
		if (this.source) this.source.setState(state);
		if (state === Asyncplify.states.CLOSED) this.dispose();
	}
};

module.exports = function (options) {
	return function (source) {
		var params = {
			beforeSaving: options && options.beforeSaving,
			savingQueue: [],
			size: options && options.size || options || 0
		};

		return new Asyncplify(ToPaged, params, source)
			.finally(function () {
				for (var i = 0; i < params.savingQueue.length; i++) {
					try {
						fs.unlinkSync(params.savingQueue[i].filename);
					} catch (ex) {
					}
				}
			});
	};
};