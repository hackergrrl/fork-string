# fork-string

> Synchronous forkable string primitive.

Like a regular textual string, except each character has a unique ID and records
what IDs are to its immediate left and right. This allows non-conflicting
changes to be made in any order.

## Usage

```js
var fstring = require('fork-string')

var str = fstring()

// A 'prev' and 'next' param of null indicates this text is a root; it depends
// on no other pre-existing string data.
var chars = str.insert(null, null, 'beep boop', 'id1')
console.log('chars1', chars)

var chars2 = str.insert(chars[8], null, 'ity!', 'id2')
console.log('chars2', chars2)

// Delete between IDs 1 and 7 ("eep boo").
str.delete(chars[1], chars[7], 'id3')

console.log('final chars', str.chars())

console.log(str.text())
```

outputs

```
chars1 [ 'id1@0', 'id1@1', 'id1@2', 'id1@3', 'id1@4', 'id1@5', 'id1@6', 'id1@7', 'id1@8' ]

chars2 [ 'id2@0', 'id2@1', 'id2@2', 'id2@3' ]

final chars [ { chr: 'b', pos: 'id1@0' },
              { chr: 'p', pos: 'id1@8' },
              { chr: 'i', pos: 'id2@0' },
              { chr: 't', pos: 'id2@1' },
              { chr: 'y', pos: 'id2@2' },
              { chr: '!', pos: 'id2@3' } ]

bpity!
```

## API

```js
var fstring = require('fork-string')
```

### var str = fstring()

Creates a new forkable string.

### str.insert(prev, next, text, id)

Insert text `text` between the IDs `prev` and `next`. The text will have the ID
`id`.

### str.delete(from, to)

Delete the text from ID `from` to ID `to`.

### str.chars()

Returns an array of all characters and their IDs, in order. Each element is of
the form

```js
{
  chr: 'H',
  pos: 'abcd@3'
}
```

### str.text()

Returns the human-readable text of the string in its current state.

### str.pos(id)

Returns the absolute position of `id` in the string.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install fork-string
```

## See Also

- [hyper-string](https://github.com/noffle/hyper-string)

## License

ISC

