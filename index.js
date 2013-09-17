
/**
 * dependencies
 */

var History = require('history')
  , emitter = require('emitter')
  , events = require('events');

/**
 * Export `Editable`.
 */

module.exports = Editable;

/**
 * Initialize new `Editable`.
 *
 * @param {Element} el
 * @param {Array} stack
 */

function Editable(el, stack){
  var self = this instanceof Editable;
  if (!self) return new Editable(el, stack);
  if (!el) throw new TypeError('expects an element');
  this.history = new History(stack || []);
  this.history.max(100);
  this.events = events(el, this);
  this.el = el;
}

/**
 * Mixins.
 */

emitter(Editable.prototype);

/**
 * Get editable contents.
 *
 * @return {String}
 * @api public
 */

Editable.prototype.contents = function(){
  return this.el.innerHTML;
};

/**
 * Toggle editable state.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.toggle = function(){
  return 'true' == this.el.contentEditable
    ? this.disable()
    : this.enable();
};

/**
 * Enable editable.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.enable = function(){
  this.el.contentEditable = true;
  this.events.bind('keyup', 'onstatechange');
  this.events.bind('click', 'onstatechange');
  this.events.bind('focus', 'onstatechange');
  this.events.bind('paste', 'onchange');
  this.events.bind('input', 'onchange');
  this.emit('enable');
  return this;
};

/**
 * Disable editable.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.disable = function(){
  this.el.contentEditable = false;
  this.events.unbind();
  this.emit('disable');
  return this;
};

/**
 * Get range.
 *
 * TODO: x-browser
 *
 * @return {Range}
 * @api public
 */

Editable.prototype.range = function(){
  return document.createRange();
};

/**
 * Get selection.
 *
 * TODO: x-browser
 *
 * @return {Selection}
 * @api public
 */

Editable.prototype.selection = function(){
  return window.getSelection();
};

/**
 * Undo.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.undo = function(){
  var buf = this.history.prev();
  if (!buf) return this;
  this.el.innerHTML = buf;
  position(this.el, buf.at);
  this.emit('state');
  return this;
};

/**
 * Redo.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.redo = function(){
  var buf = this.history.next();
  if (!buf) return this;
  this.el.innerHTML = buf;
  position(this.el, buf.at);
  this.emit('state');
  return this;
};

/**
 * Execute the given `cmd` with `val`.
 *
 * @param {String} cmd
 * @param {Mixed} val
 * @return {Editable}
 * @api public
 */

Editable.prototype.execute = function(cmd, val){
  document.execCommand(cmd, false, val);
  this.onstatechange();
  return this;
};

/**
 * Query `cmd` state.
 *
 * @param {String} cmd
 * @return {Boolean}
 * @api public
 */

Editable.prototype.state = function(cmd){
  var length = this.history.vals.length - 1
    , stack = this.history;

  if ('undo' == cmd) return 0 < stack.i;
  if ('redo' == cmd) return length > stack.i;
  return document.queryCommandState(cmd);
};

/**
 * Emit `state`.
 *
 * @param {Event} e
 * @return {Editable}
 * @api private
 */

Editable.prototype.onstatechange = function(e){
  this.emit('state', e);
  return this;
};

/**
 * Emit `change` and push current `buf` to history.
 *
 * @param {Event} e
 * @return {Editable}
 * @api private
 */

Editable.prototype.onchange = function(e){
  var buf = new String(this.contents());
  buf.at = position(el);
  this.history.add(buf);
  return this.emit('change', e);
};

/**
 * Set / get caret position with `el`.
 *
 * @param {Element} el
 * @param {Number} at
 * @return {Number}
 * @api private
 */

function position(el, at){
  if (1 == arguments.length) {
    var range = window.getSelection().getRangeAt(0);
    var clone = range.cloneRange();
    clone.selectNodeContents(el);
    clone.setEnd(range.endContainer, range.endOffset);
    return clone.toString().length;
  }

  var length = 0
    , abort;

  visit(el, function(node){
    if (3 != node.nodeType) return;
    length += node.textContent.length;
    if (length >= at) {
      if (abort) return;
      abort = true;
      var sel = document.getSelection();
      var range = document.createRange();
      var sub = length - node.textContent.length;
      range.setStart(node, at - sub);
      range.setEnd(node, at - sub);
      sel.removeAllRanges();
      sel.addRange(range);
      return true;
    }
  });
}

/**
 * Walk all text nodes of `node`.
 *
 * @param {Element|Node} node
 * @param {Function} fn
 * @api private
 */

function visit(node, fn){
  var nodes = node.childNodes;
  for (var i = 0; i < nodes.length; ++i) {
    if (fn(nodes[i])) break;
    visit(nodes[i], fn);
  }
}


