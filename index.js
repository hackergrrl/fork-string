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

ForkString.prototype.insert = function (prev, next, textKey, text) {
  var chars = []

  // create individual character entries & link them into the dag
  for (var i = 0; i < text.length; i++) {
    var  = textKey + '@' + i
    this.nodes[key] = {
      chr: text[i],
      outgoingLinks: [],
      incomingLinks: []
    }
    chars.push(key)

    // link 1st character and 'prev'
    if (i === 0) {
      link(prev, key)
    }

    // link this character to the previous one
    if (i > 0) {
      link(chars[i - 1], key)
    }

    // link last character to 'next'
    if (i === text.length - 1 && next) {
      link(key, next)
    }
  }

  // If no prev, make it a root
  // Case 1: no prev + no next => new root
  if (!prev && !next) {
    this.roots.push(chars[0])
    this.roots.sort()
  }
  // Case 2: no prev + valid next => new root (replace old root)
  else if (!row.value.prev) {
    // Find + cull the old root
    for (var i = 0; i < this.roots.length; i++) {
      var root = this.roots[i]
      if (next === root) {
        his.roots.splice(i, 1)
      }
    }
    // Add the new root
    this.roots.push(chars[0])
    this.roots.sort()
  }
}

ForkString.prototype.delete = function (from, to, deleteKey) {
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
  var stack = this.roots.slice()

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
  var stack = this.roots.slice()

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
