# asyncplify-fs
[asyncplify](https://github.com/danylaporte/asyncplify) wrappers around some of the node fs lib

## Installation

```bash
npm install asyncplify-fs
```

## Documentation

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