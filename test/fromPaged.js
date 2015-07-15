var asyncplify = require('asyncplify');
var asyncplifyFs = require('../index');
var fs = require('fs');
var tests = require('asyncplify-tests');

describe('fromPaged', function () {
    
    fs.writeFileSync('page1.json', '[1, 2]');
    fs.writeFileSync('page2.json', '[3, 4]');
    
    asyncplifyFs
        .fromPaged(['page1.json', 'page2.json'])
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEmitValues([1, 2, 3, 4]));
})