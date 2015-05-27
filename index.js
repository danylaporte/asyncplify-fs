var Asyncplify = require('asyncplify');
var fs = require('fs');
var Watch = require('./watch');

module.exports = {
	access: function (options) {
		return Asyncplify.fromNode(fs.access, options.path || options, options.mode);
	},
	appendFile: function (options) {
		return Asyncplify.fromNode(fs.appendFile, options.path, options.data, options);
	},
	exists: function (path) {
		return Asyncplify.fromNode(fs.exists, path);
	},
	lstat: function (path) {
		return Asyncplify.fromNode(fs.lstat, path);
	},
	mkdir: function (options) {
		return Asyncplify.fromNode(fs.mkdir, options.path || options, options.mode);
	},
	readdir: function (path) {
		return Asyncplify.fromNode(fs.readdir, path);
	},
	readFile: function (options) {
		return Asyncplify.fromNode(fs.readFile, options.path || options, options.encoding);
	},
	rename: function (options) {
		return Asyncplify.fromNode(fs.rename, options.oldPath, options.newPath);
	},
	rmdir: function (path) {
		return Asyncplify.fromNode(fs.rmdir, path);
	},
	stat: function (path) {
		return Asyncplify.fromNode(fs.stat, path);
	},
	unlink: function (path) {
		return Asyncplify.fromNode(fs.unlink, path);
	},
	utimes: function (options) {
		return Asyncplify.fromNode(fs.utimes, options.path, options.atime, options.mtime);
	},
	watch: function (options) {
		return new Asyncplify(Watch, options);
	},
	writeFile: function (options) {
		return Asyncplify.fromNode(fs.writeFile, options.path, options.data, options);
	}
};