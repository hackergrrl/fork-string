/* eslint-disable handle-callback-err */

var test = require('tape')
var fstring = require('../')

function genId () {
  return String(Math.random()).substring(2)
}

test('insertions', function (t) {
  var str = fstring()

  var id = genId()
  var chars = str.insert(null, null, 'H', id)
  t.deepEqual(chars, [id + '@0'])
  t.equals(str.text(), 'H')

  var id2 = genId()
  var chars2 = str.insert(chars[0], null, 'e', id2)
  t.deepEqual(chars2, [id2 + '@0'])
  t.equals(str.text(), 'He')

  var id3 = genId()
  var chars3 = str.insert(chars[0], chars[2], 'ol', id3)
  t.deepEqual(chars3, [id3+'@0', id3+'@1'])
  t.equals(str.text(), 'Hole')

  var expected = [
    { chr: 'H', pos: chars[0] },
    { chr: 'o', pos: chars3[0] },
    { chr: 'l', pos: chars3[1] },
    { chr: 'e', pos: chars2[0] }
  ]
  t.deepEquals(str.chars(), expected)

  t.equals(str.pos(chars3[1]), 2)

  t.end()
})

test('insert with same prev twice', function (t) {
  var str = fstring()

  var chars = str.insert(null, null, 'Hello', genId())
  str.insert(chars[0], chars[1], 'ey', genId())
  str.insert(chars[0], chars[1], 'ola', genId())

  t.equals(str.text(), 'Holaeyello')

  t.end()
})

test('deletions', function (t) {
  var str = fstring()

  var id = genId()
  var chars = str.insert(null, null, 'beep boop', id)

  var chars2 = str.delete(chars[1], chars[7])

  t.equals(str.text(), 'bp')

  var expected = [
    { chr: 'b', pos: chars[0] },
    { chr: 'p', pos: chars[8] }
  ]
  t.deepEquals(str.chars(), expected)

  t.equals(str.pos(chars[8]), 1)

  t.end()
})

test('insert: invalid input errors', function (t) {
  t.plan(1)
  var str = fstring()

  t.throws(function () {
    str.insert(null, null)
  })
})

test('delete: invalid input errors', function (t) {
  t.plan(3)
  var str = fstring()

  t.throws(function () {
    str.delete(null)
  })
  t.throws(function () {
    str.delete(null, '1')
  })
  t.throws(function () {
    str.delete(null, -1)
  })
})

test('multiple roots', function (t) {
  var str = fstring()

  str.insert(null, null, 'Hello', 'B')
  var chars = str.insert(null, null, 'Heya', 'A')

  t.equals(str.text(), 'HelloHeya')

  t.equals(str.pos(chars[0]), 5)

  t.end()
})

test('replacing a root', function (t) {
  var str = fstring()

  var id1 = genId()
  var id2 = genId()

  var chars = str.insert(null, null, 'Hey thar', id1)
  str.insert(null, chars[0], 'Greetings and ', id2)

  t.equals(str.text(), 'Greetings and Hey thar')

  t.equals(str.pos(chars[0]), 14)

  t.end()
})
