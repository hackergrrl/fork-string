module.exports = ForkString

function ForkString (opts) {
  if (!(this instanceof ForkString)) { return new ForkString(opts) }

  opts = opts || {}

  this.nodes = {}
  this.roots = []
}

ForkString.prototype._link = function (fromKey, toKey) {
  var from = this.nodes[fromKey]
  var to = this.nodes[toKey]

  if (!from || !to) return

  from.outgoingLinks.push(toKey)
  to.incomingLinks.push(fromKey)
}

ForkString.prototype.insert = function (prev, next, text, textKey) {
  var chars = []

  // create individual character entries & link them into the dag
  for (var i = 0; i < text.length; i++) {
    var key = textKey + '@' + i
    var node = {
      chr: text[i],
      outgoingLinks: [],
      incomingLinks: []
    }
    this.nodes[key] = node
    chars.push(key)

    // link 1st character and 'prev'
    if (i === 0) {
      this._link(prev, key)
    }

    // link this character to the previous one
    if (i > 0) {
      this._link(chars[i - 1], key)
    }

    // link last character to 'next'
    if (i === text.length - 1 && next) {
      this._link(key, next)
    }
  }

  // If no prev, make it a root
  // Case 1: no prev + no next => new root
  if (!prev && !next) {
    this.roots.push(chars[0])
    this.roots.sort(rootCmp.bind(null, this))
  }
  // Case 2: no prev + valid next => new root (replace old root)
  else if (!prev) {
    // Find + cull the old root
    for (var i = 0; i < this.roots.length; i++) {
      var root = this.roots[i]
      if (next === root) {
        this.roots.splice(i, 1)
        node.realRoot = root
      }
    }
    // Add the new root
    this.roots.push(chars[0])
    this.roots.sort(rootCmp.bind(null, this))
  }

  return chars
}

ForkString.prototype.delete = function (from, to) {
  var visited = {}
  var stack = [from]

  while (stack.length > 0) {
    var key = stack.pop()

    if (visited[key]) {
      continue
    }

    var dagnode = this.nodes[key]

    // bail if there are other nodes to visit before this one
    var needToBail = false
    for (var i = 0; i < dagnode.incomingLinks.length; i++) {
      if (!visited[dagnode.incomingLinks[i]] && key !== from) {
        needToBail = true
      }
    }
    if (needToBail) continue

    this.nodes[key].deleted = true
    visited[key] = true

    if (key === to) {
      break
    }

    stack.push.apply(stack, dagnode.outgoingLinks)
  }
}

ForkString.prototype.chars = function (cb) {
  var string = []
  var visited = {}
  var stack = this.roots.slice().reverse()

  while (stack.length > 0) {
    var key = stack.pop()

    if (visited[key]) {
      continue
    }

    var dagnode = this.nodes[key]

    // bail if there are other nodes to visit before this one
    var needToBail = false
    for (var i = 0; i < dagnode.incomingLinks.length; i++) {
      if (!visited[dagnode.incomingLinks[i]]) {
        needToBail = true
      }
    }
    if (needToBail) continue

    if (!dagnode.deleted) {
      var elem = {
        chr: dagnode.chr,
        pos: key
      }
      string.push(elem)
    }
    visited[key] = true
    stack.push.apply(stack, dagnode.outgoingLinks)
  }

  return string
}

// The current state of the hyperstring, serialized to a plain string.
ForkString.prototype.text = function (cb) {
  var string = ''
  var visited = {}
  var stack = this.roots.slice().reverse()

  while (stack.length > 0) {
    var key = stack.pop()

    if (visited[key]) {
      continue
    }

    var dagnode = this.nodes[key]

    // bail if there are other nodes to visit before this one
    var needToBail = false
    for (var i = 0; i < dagnode.incomingLinks.length; i++) {
      if (!visited[dagnode.incomingLinks[i]]) {
        needToBail = true
      }
    }
    if (needToBail) continue

    if (!dagnode.deleted) {
      string += dagnode.chr
    }
    visited[key] = true
    stack.push.apply(stack, dagnode.outgoingLinks)
  }

  return string
}

ForkString.prototype.pos = function (id) {
  var visited = {}
  var stack = this.roots.slice().reverse()
  var pos = 0

  while (stack.length > 0) {
    var key = stack.pop()

    if (visited[key]) {
      continue
    }

    var dagnode = this.nodes[key]

    // bail if there are other nodes to visit before this one
    var needToBail = false
    for (var i = 0; i < dagnode.incomingLinks.length; i++) {
      if (!visited[dagnode.incomingLinks[i]]) {
        needToBail = true
      }
    }
    if (needToBail) continue

    if (key === id) {
      return pos
    }

    if (!dagnode.deleted) pos++

    visited[key] = true
    stack.push.apply(stack, dagnode.outgoingLinks)
  }
}

ForkString.prototype.clone = function () {
  var copy = new ForkString()
  copy.nodes = JSON.parse(JSON.stringify(this.nodes))
  copy.roots = JSON.parse(JSON.stringify(this.roots))
  return copy
}

function rootCmp (index, a, b) {
  var A = index.nodes[a]
  var B = index.nodes[b]

  var aPos = A.realRoot || a
  var bPos = B.realRoot || b

  if (aPos > bPos) return 1
  else if (aPos < bPos) return -1
  else return 0
}
