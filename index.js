
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
  this.history.add(this.contents());
  return this.emit('change', e);
};


