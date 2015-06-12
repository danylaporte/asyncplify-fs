var Asyncplify = require('asyncplify');
var debug = require('debug')('asyncplify-fs:toPaged');
var fs = require('fs');
var states = Asyncplify.states;
var temp = require('temp');

function noop() { }

function ToPaged(options, on, source) {
	var self = this;

	this.error = null;
	this.handlePageSaved = function (err) { self.pageSaved(err); };
	this.items = [];
	this.on = on;
	this.options = options;
	this.beforeSaving = options && options.beforeSaving || noop;
	this.saving = false;
	this.source = null;
	this.sourcePaused = false;
	this.state = states.RUNNING;

	on.source = this;
	source._subscribe(this);
}

ToPaged.prototype = {
	do: function () {
		this.doEmit();
		this.doPendingSave();
		this.doEnd();
	},
	doEmit: function () {
		var filename = this.options.filename;

		if (filename && !this.saving && this.state === states.RUNNING && !this.error) {
			this.options.filename = null;
			debug('emit page');
			this.on.emit(filename);
		}
	},
	doEnd: function () {
		if (!this.saving && this.state === states.RUNNING && (this.error || !this.source)) {
			debug('end');
			this.state === states.CLOSED;
			this.on.end(this.error);
		}
	},
	doPendingSave: function () {
		if (!this.saving && this.items.length && (this.items.length === this.options.size || !this.source) && this.state !== states.CLOSED && !this.error) {
			this.savePage();

			if (this.source && this.sourcePaused) {
				this.sourcePaused = false;
				if (this.state === states.RUNNING) this.source.setState(states.RUNNING);
			}
		}
	},
	emit: function (value) {
		this.items.push(value);

		if (this.items.length === this.options.size && this.items.length) {
			if (this.saving) {
				this.sourcePaused = true;
				this.source.setState(states.PAUSED);
			} else {
				this.savePage();
			}
		}
	},
	end: function (err) {
		this.error = this.error || err;
		this.source = null;
		this.do();
	},
	pageSaved: function (err) {
		if (err)
			debug('error saving page %s', err);
		else
			debug('page saved');

		this.saving = false;
		this.error = this.error || err;
		this.do();
	},
	savePage: function () {
		debug('saving a page of %d items', this.items.length);

		var args = {
			filename: temp.path(),
			items: this.items
		};
		
		this.beforeSaving(args);
		this.options.filename = args.filename;
		
		fs.writeFile(args.filename, JSON.stringify(args.items), this.handlePageSaved);
		this.saving = true;
		this.items.length = 0;
	},
	setState: function (state) {
		if (this.state !== state && this.state !== states.CLOSED) {
			this.state = state;

			if (this.state === states.RUNNING) this.do();

			if (this.source && state !== states.RUNNING || !this.sourcePaused)
				this.source.setState(state);
		}
	}
};

module.exports = function (options) {
	return function (source) {
		var params = {
			beforeSaving: options && options.beforeSaving,
			filename: null,
			size: options && options.size || options || 0
		};

		return new Asyncplify(ToPaged, params, source)
			.finally(function () {
				if (params.filename) {
					try {
						fs.unlinkSync(params.filename);
					} catch (ex) {
					}
				}
			});
	};
};