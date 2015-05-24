var Asyncplify = require('asyncplify');
var fs = require('fs');
var Watch = require('./watch');

module.exports = {
	access: function (options) {
		return Asyncplify.fromNode(function (cb) {
			fs.access(options.path || options, options.mode ? options.mode : cb, options.mode && cb);
		});
	},
	appendFile: function (options) {
		return Asyncplify.fromNode(function (cb) {
			fs.appendFile(options.path, options.data, options, cb);
		});
	},
	exists: function (path) {
		return Asyncplify.fromNode(function (cb) {
			fs.exists(path, cb);
		});
	},
	lstat: function (path) {
		return Asyncplify.fromNode(function (cb) {
			fs.lstat(path, cb);
		});
	},
	mkdir: function (options) {
		return Asyncplify.fromNode(function (cb) {
			fs.mkdir(options.path || options, options.mode ? options.mode : cb, options.mode && cb);
		});
	},
	readdir: function (path) {
		return Asyncplify.fromNode(function (cb) {
			fs.readdir(path, cb);
		});
	},
	readFile: function (options) {
		return Asyncplify.fromNode(function (cb) {
			fs.readFile(options.path || options, options, cb);
		});
	},
	rename: function (options) {
		return Asyncplify.fromNode(function (cb) {
			fs.rename(options.oldPath, options.newPath, cb);
		});
	},
	rmdir: function (path) {
		return Asyncplify.fromNode(function (cb) {
			fs.rmdir(path, cb);
		});
	},
	stat: function (path) {
		return Asyncplify.fromNode(function (cb) {
			fs.stat(path, cb);
		});
	},
	unlink: function (path) {
		return Asyncplify.fromNode(function (cb) {
			fs.unlink(path, cb);
		});
	},
	utimes: function (options) {
		return Asyncplify.fromNode(function (cb) {
			fs.utimes(options.path, options.atime, options.mtime, cb);
		});
	},
	watch: function (options) {
		return new Asyncplify(Watch, options);
	},
	writeFile: function (options) {
		return Asyncplify.fromNode(function (cb) {
			fs.writeFile(options.path, options.data, options, cb);
		});
	}
};