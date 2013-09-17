
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-history/index.js", function(exports, require, module){

/**
 * Expose `History`.
 */

module.exports = History;

/**
 * Initialize a `History` with the given `vals`.
 *
 * @param {Array} vals
 * @api public
 */

function History(vals) {
  this.vals = vals || [];
  this.reset();
  this.max(1000);
}

/**
 * Cap the entries.
 *
 * @api private
 */

History.prototype.cap = function(){
  var max = this._max;
  var len = this.vals.length;
  var remove = len - max;
  if (remove <= 0) return;
  while (remove--) this.vals.shift();
  this.reset();
};

/**
 * Set the maximum number of entries to `n`.
 *
 * @param {Number} n
 * @return {History}
 * @api public
 */

History.prototype.max = function(n){
  this._max = n;
  this.cap();
  return this;
};

/**
 * Add a `val`.
 *
 * @param {Object} val
 * @return {History}
 * @api public
 */

History.prototype.add = function(val){
  this.i = this.vals.push(val) - 1;
  this.cap();
  return this;
};

/**
 * Cycle backwards through history.
 *
 * @return {Object}
 * @api public
 */

History.prototype.prev = function(){
  if (this.i < 0) return;
  return this.vals[this.i--];
};

/**
 * Cycle forward through history.
 *
 * @return {Object}
 * @api public
 */

History.prototype.next = function(){
  var len = this.vals.length;
  if (this.i == len - 1) return;
  return this.vals[++this.i];
};

/**
 * Reset the history index.
 *
 * @return {History}
 * @api public
 */

History.prototype.reset = function(){
  this.i = this.vals.length - 1;
  return this;
};

});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-query/index.js", function(exports, require, module){

function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("component-delegate/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var matches = require('matches-selector')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    if (matches(e.target, selector)) fn(e);
  }, capture);
  return callback;
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("yields-editable/index.js", function(exports, require, module){

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
  console.count(buf);
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



});
require.register("yields-keycode/index.js", function(exports, require, module){

/**
 * map
 */

var map = {
    backspace: 8
  , tab: 9
  , clear: 12
  , enter: 13
  , shift: 16
  , ctrl: 17
  , alt: 18
  , capslock: 20
  , escape: 27
  , esc: 27
  , space: 32
  , left: 37
  , up: 38
  , right: 39
  , down: 40
  , del: 46
  , comma: 188
  , ',': 188
  , '.': 190
  , '/': 191
  , '`': 192
  , '-': 189
  , '=': 187
  , ';': 186
  , '[': 219
  , '\\': 220
  , ']': 221
  , '\'': 222
};

/**
 * find a keycode.
 *
 * @param {String} name
 * @return {Number}
 */

module.exports = function(name){
  return map[name] || name.toUpperCase().charCodeAt(0);
};

});
require.register("component-bind/index.js", function(exports, require, module){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("component-os/index.js", function(exports, require, module){


module.exports = os();

function os() {
  var ua = navigator.userAgent;
  if (/mac/i.test(ua)) return 'mac';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
}

});
require.register("yields-k/index.js", function(exports, require, module){

/**
 * dependencies.
 */

var event = require('event')
  , proto = require('./proto')
  , bind = require('bind');

/**
 * create a new dispatcher with `el`.
 *
 * example:
 *
 *      var k = require('k')(window);
 *      k('shift + tab', function(){});
 *
 * @param {Element} el
 * @return {Function}
 */

module.exports = function(el){
  function k(e, fn){ k.handle(e, fn) };
  k._handle = bind(k, proto.handle);
  k._clear = bind(k, proto.clear);
  event.bind(el, 'keydown', k._handle, false);
  event.bind(el, 'keyup', k._clear, false);
  event.bind(el, 'focus', k._clear, false);
  k.listeners = {};
  for (var p in proto) k[p] = proto[p];
  k.el = el;
  return k;
};

});
require.register("yields-k/proto.js", function(exports, require, module){

/**
 * dependencies
 */

var keycode = require('keycode')
  , event = require('event')
  , os = require('os');

/**
 * modifiers.
 */

var modifiers = {
  91: 'command',
  93: 'command',
  16: 'shift',
  17: 'ctrl',
  18: 'alt'
};

/**
 * Super key.
 */

exports.super = 'mac' == os
  ? 'command'
  : 'ctrl';

/**
 * handle the given `KeyboardEvent` or bind
 * a new `keys` handler.
 *
 * @param {String|KeyboardEvent} e
 * @param {Function} fn
 */

exports.handle = function(e, fn){
  var all = this.listeners[e.which]
    , len = all && all.length
    , ignore = this.ignore
    , invoke = true
    , handle
    , mods
    , mlen;

  // bind
  if (fn) return this.bind(e, fn);

  // modifiers
  if (modifiers[e.which]) {
    this.super = exports.super == modifiers[e.which];
    this[modifiers[e.which]] = true;
    this.modifiers = true;
    return;
  }

  // ignore
  if (ignore && ignore(e)) return;

  // match
  for (var i = 0; i < len; ++i) {
    invoke = true;
    handle = all[i];
    mods = handle.mods;
    mlen = mods.length;

    for (var j = 0; j < mlen; ++j) {
      if (!this[mods[j]]) {
        invoke = null;
        break;
      }
    }

    invoke && handle.fn(e);
  }
};

/**
 * destroy this `k` dispatcher instance.
 */

exports.destroy = function(){
  event.unbind(this.el, 'keydown', this._handle);
  event.unbind(this.el, 'keyup', this._clear);
  event.unbind(this.el, 'focus', this._clear);
  this.listeners = {};
};

/**
 * unbind the given `keys` with optional `fn`.
 *
 * example:
 *
 *      k.unbind('enter, tab', myListener); // unbind `myListener` from `enter, tab` keys
 *      k.unbind('enter, tab'); // unbind all `enter, tab` listeners
 *      k.unbind(); // unbind all listeners
 *
 * @param {String} keys
 * @param {Function} fn
 * @return {self}
 */

exports.unbind = function(keys, fn){
  var listeners = this.listeners
    , index
    , key
    , len;

  if (!keys) {
    this.listeners = {};
    return this;
  }

  keys = keys.split(/ *, */);
  for (var i = 0, len = keys.length; i < len; ++i) {
    key = keycode(keys[i]);
    if (null == fn) {
      listeners[key] = [];
    } else {
      index = listeners[key].indexOf(fn);
      listeners[key].splice(i, 1);
    }
  }

  return this;
};

/**
 * bind the given `keys` to `fn`.
 *
 * example:
 *
 *      k.bind('shift + tab, ctrl + a', function(e){});
 *
 * @param {String} keys
 * @param {Function} fn
 * @return {self}
 */

exports.bind = function(keys, fn){
  var fns = this.listeners
    , mods = []
    , key;

  // superkey
  keys = keys.replace('super', exports.super);

  // support `,`
  var all = ',' != keys
    ? keys.split(/ *, */)
    : [','];

  // bind
  for (var i = 0, len = all.length; i < len; ++i) {
    if ('' == all[i]) continue;
    mods = all[i].split(/ *\+ */);
    key = keycode(mods.pop() || ',');
    if (!fns[key]) fns[key] = [];
    fns[key].push({ mods: mods, fn: fn });
  }

  return this;
};

/**
 * clear all modifiers on `keyup`.
 */

exports.clear = function(e){
  var code = e.keyCode;
  if (!(code in modifiers)) return;
  this[modifiers[code]] = null;
  this.modifiers = this.command
    || this.shift
    || this.ctrl
    || this.alt;
};

/**
 * Ignore all input elements by default.
 *
 * @param {Event} e
 * @return {Boolean}
 */

exports.ignore = function(e){
  var el = e.target || e.srcElement;
  var name = el.tagName.toLowerCase();
  return 'textarea' == name
    || 'select' == name
    || 'input' == name;
};

});







require.alias("yields-editable/index.js", "editable-demo/deps/editable/index.js");
require.alias("yields-editable/index.js", "editable-demo/deps/editable/index.js");
require.alias("yields-editable/index.js", "editable/index.js");
require.alias("component-history/index.js", "yields-editable/deps/history/index.js");

require.alias("component-emitter/index.js", "yields-editable/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-events/index.js", "yields-editable/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("yields-editable/index.js", "yields-editable/index.js");
require.alias("yields-k/index.js", "editable-demo/deps/k/index.js");
require.alias("yields-k/proto.js", "editable-demo/deps/k/proto.js");
require.alias("yields-k/index.js", "k/index.js");
require.alias("yields-keycode/index.js", "yields-k/deps/keycode/index.js");

require.alias("component-event/index.js", "yields-k/deps/event/index.js");

require.alias("component-bind/index.js", "yields-k/deps/bind/index.js");

require.alias("component-os/index.js", "yields-k/deps/os/index.js");
