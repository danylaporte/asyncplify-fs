# asyncplify-fs
[asyncplify](https://github.com/danylaporte/asyncplify) wrappers around some of the node fs lib

## Installation

```bash
npm install asyncplify-fs
```

## Documentation

### fromPaged(options)
Asynchronously reads multiple files from disk and returns the items.

options:
- autoDelete Boolean default = false
- filenames Array

Example:
```js
fs.writeFileSync('page1.json', [1, 2]);
fs.writeFileSync('page2.json', [3, 4]);

asyncplifyFs
	.fromPaged(['page1.json', 'page2.json'])
	.subscribe({
		emit: function (data) {
			console.log(data);
		},
		end: function (err) {
			if (err) throw err;
		}
	});
    
    // 1
    // 2
    // 3
    // 4
    // end.
```
When autoDelete = true, the the files are automatically deleted from the disk once loaded.

### readFile(options)
Asynchronously reads the entire contents of a file. 

options:
- path String
- encoding 	String | Null default = null
- flag		String default = 'r'

Example:
```js
asyncplifyFs
	.readFile('/etc/passwd')
	.subscribe({
		emit: function (data) {
			console.log(data);
		},
		end: function (err) {
			if (err) throw err;
		}
	});
```
### writeFile(options)
Asynchronously writes data to a file, replacing the file if it already exists. data can be a string or a buffer.

options:
- path String
- data String | Buffer
- encoding 	String | Null default = 'utf8'
- mode 		Number default = 438
- flag		String default = 'w'

Example:
```js
asyncplifyFs
	.writeFile({
		path: 'message.txt',
		data: 'Hello asyncplify'
	})
	.subscribe({
		emit: function (data) {
			console.log(data);
		},
		end: function (err) {
			if (err) throw err;
		}
	});
```
## License
The MIT License (MIT)

Copyright (c) 2015 Dany Laporte