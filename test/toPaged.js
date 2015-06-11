var assert = require('assert');
var asyncplify = require('asyncplify');
var fs = require('fs');
var asyncplifyFs = require('../index');
var should = require('should');

describe('toPaged', function () {
    
    it('should emit 3 pages', function (done) {
        var array = [];
    
        asyncplify
			.fromArray([1, 2, 3, 4, 5])
			.pipe(asyncplifyFs.toPaged(2))
			.subscribe({
				emit: array.push.bind(array),
				end: function (err) {
					for (var i = 0; i < array.length; i++) {
						fs.unlinkSync(array[i]);
					}
					
					assert(err === null);
					array.length.should.eql(3);
					done();
				}
			});
    });
    
})