var assert = require('assert');
var asyncplify = require('asyncplify');
var fs = require('fs');
var asyncplifyFs = require('../index');
var should = require('should');

describe('fromPaged', function () {
    
    it('should emit all items in all pages', function (done) {
        var array = [];
    
        fs.writeFileSync('page1.json', '[1, 2]');
        fs.writeFileSync('page2.json', '[3, 4]');

        asyncplifyFs
            .fromPaged(['page1.json', 'page2.json'])
            .subscribe({
                emit: function (value) {
                    array.push(value);
                },
                end: function (err) {
                    assert(err === null);
                    array.should.eql([1, 2, 3, 4]);
                    done();
                }
            });
    });
    
})