
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
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
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
  var index = path + '/index.js';

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
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
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
require.register("component-history/index.js", Function("exports, require, module",
"\n/**\n * Expose `History`.\n */\n\nmodule.exports = History;\n\n/**\n * Initialize a `History` with the given `vals`.\n *\n * @param {Array} vals\n * @api public\n */\n\nfunction History(vals) {\n  this.vals = vals || [];\n  this.reset();\n  this.max(1000);\n}\n\n/**\n * Cap the entries.\n *\n * @api private\n */\n\nHistory.prototype.cap = function(){\n  var max = this._max;\n  var len = this.vals.length;\n  var remove = len - max;\n  if (remove <= 0) return;\n  while (remove--) this.vals.shift();\n  this.reset();\n};\n\n/**\n * Set the maximum number of entries to `n`.\n *\n * @param {Number} n\n * @return {History}\n * @api public\n */\n\nHistory.prototype.max = function(n){\n  this._max = n;\n  this.cap();\n  return this;\n};\n\n/**\n * Add a `val`.\n *\n * @param {Object} val\n * @return {History}\n * @api public\n */\n\nHistory.prototype.add = function(val){\n  this.i = this.vals.push(val) - 1;\n  this.cap();\n  return this;\n};\n\n/**\n * Cycle backwards through history.\n *\n * @return {Object}\n * @api public\n */\n\nHistory.prototype.prev = function(){\n  if (this.i < 0) return;\n  return this.vals[this.i--];\n};\n\n/**\n * Cycle forward through history.\n *\n * @return {Object}\n * @api public\n */\n\nHistory.prototype.next = function(){\n  var len = this.vals.length;\n  if (this.i == len - 1) return;\n  return this.vals[++this.i];\n};\n\n/**\n * Reset the history index.\n *\n * @return {History}\n * @api public\n */\n\nHistory.prototype.reset = function(){\n  this.i = this.vals.length - 1;\n  return this;\n};\n//@ sourceURL=component-history/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = index(callbacks, fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  if (el.addEventListener) {\n    el.addEventListener(type, fn, capture || false);\n  } else {\n    el.attachEvent('on' + type, fn);\n  }\n  return fn;\n};\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  if (el.removeEventListener) {\n    el.removeEventListener(type, fn, capture || false);\n  } else {\n    el.detachEvent('on' + type, fn);\n  }\n  return fn;\n};\n//@ sourceURL=component-event/index.js"
));
require.register("component-event-manager/index.js", Function("exports, require, module",
"\n\n/**\n * Expose `EventManager`.\n */\n\nmodule.exports = EventManager;\n\n/**\n * Initialize an `EventManager` with the given\n * `target` object which events will be bound to,\n * and the `obj` which will receive method calls.\n *\n * @param {Object} target\n * @param {Object} obj\n * @api public\n */\n\nfunction EventManager(target, obj) {\n  this.target = target;\n  this.obj = obj;\n  this._bindings = {};\n}\n\n/**\n * Register bind function.\n *\n * @param {Function} fn\n * @return {EventManager} self\n * @api public\n */\n\nEventManager.prototype.onbind = function(fn){\n  this._bind = fn;\n  return this;\n};\n\n/**\n * Register unbind function.\n *\n * @param {Function} fn\n * @return {EventManager} self\n * @api public\n */\n\nEventManager.prototype.onunbind = function(fn){\n  this._unbind = fn;\n  return this;\n};\n\n/**\n * Bind to `event` with optional `method` name.\n * When `method` is undefined it becomes `event`\n * with the \"on\" prefix.\n *\n *    events.bind('login') // implies \"onlogin\"\n *    events.bind('login', 'onLogin')\n *\n * @param {String} event\n * @param {String} [method]\n * @return {Function} callback\n * @api public\n */\n\nEventManager.prototype.bind = function(event, method){\n  var fn = this.addBinding.apply(this, arguments);\n  if (this._onbind) this._onbind(event, method, fn);\n  this._bind(event, fn);\n  return fn;\n};\n\n/**\n * Add event binding.\n *\n * @param {String} event\n * @param {String} method\n * @return {Function} callback\n * @api private\n */\n\nEventManager.prototype.addBinding = function(event, method){\n  var obj = this.obj;\n  var method = method || 'on' + event;\n  var args = [].slice.call(arguments, 2);\n\n  // callback\n  function callback() {\n    var a = [].slice.call(arguments).concat(args);\n    obj[method].apply(obj, a);\n  }\n\n  // subscription\n  this._bindings[event] = this._bindings[event] || {};\n  this._bindings[event][method] = callback;\n\n  return callback;\n};\n\n/**\n * Unbind a single binding, all bindings for `event`,\n * or all bindings within the manager.\n *\n *     evennts.unbind('login', 'onLogin')\n *     evennts.unbind('login')\n *     evennts.unbind()\n *\n * @param {String} [event]\n * @param {String} [method]\n * @return {Function} callback\n * @api public\n */\n\nEventManager.prototype.unbind = function(event, method){\n  if (0 == arguments.length) return this.unbindAll();\n  if (1 == arguments.length) return this.unbindAllOf(event);\n  var fn = this._bindings[event][method];\n  if (this._onunbind) this._onunbind(event, method, fn);\n  this._unbind(event, fn);\n  return fn;\n};\n\n/**\n * Unbind all events.\n *\n * @api private\n */\n\nEventManager.prototype.unbindAll = function(){\n  for (var event in this._bindings) {\n    this.unbindAllOf(event);\n  }\n};\n\n/**\n * Unbind all events for `event`.\n *\n * @param {String} event\n * @api private\n */\n\nEventManager.prototype.unbindAllOf = function(event){\n  var bindings = this._bindings[event];\n  if (!bindings) return;\n  for (var method in bindings) {\n    this.unbind(event, method);\n  }\n};\n//@ sourceURL=component-event-manager/index.js"
));
require.register("component-events/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar Manager = require('event-manager')\n  , event = require('event');\n\n/**\n * Return a new event manager.\n */\n\nmodule.exports = function(target, obj){\n  var manager = new Manager(target, obj);\n\n  manager.onbind(function(name, fn){\n    event.bind(target, name, fn);\n  });\n\n  manager.onunbind(function(name, fn){\n    event.unbind(target, name, fn);\n  });\n\n  return manager;\n};\n//@ sourceURL=component-events/index.js"
));
require.register("yields-keycode/index.js", Function("exports, require, module",
"\n/**\n * map\n */\n\nvar map = {\n    backspace: 8\n  , tab: 9\n  , clear: 12\n  , enter: 13\n  , shift: 16\n  , ctrl: 17\n  , alt: 18\n  , capslock: 20\n  , escape: 27\n  , esc: 27\n  , space: 32\n  , left: 37\n  , up: 38\n  , right: 39\n  , down: 40\n  , del: 46\n  , comma: 188\n  , ',': 188\n  , '.': 190\n  , '/': 191\n  , '`': 192\n  , '-': 189\n  , '=': 187\n  , ';': 186\n  , '[': 219\n  , '\\\\': 220\n  , ']': 221\n  , '\\'': 222\n};\n\n/**\n * find a keycode.\n *\n * @param {String} name\n * @return {Number}\n */\n\nmodule.exports = function(name){\n  return map[name] || name.toUpperCase().charCodeAt(0);\n};\n//@ sourceURL=yields-keycode/index.js"
));
require.register("yields-merge/index.js", Function("exports, require, module",
"\n/**\n * merge `b`'s properties with `a`'s.\n *\n * example:\n *\n *        var user = {};\n *        merge(user, console);\n *        // > { log: fn, dir: fn ..}\n *\n * @param {Object} a\n * @param {Object} b\n * @return {Object}\n */\n\nmodule.exports = function (a, b) {\n  for (var k in b) a[k] = b[k];\n  return a;\n};\n//@ sourceURL=yields-merge/index.js"
));
require.register("yields-k/index.js", Function("exports, require, module",
"\n/**\n * dependencies.\n */\n\nvar event = require('event')\n  , merge = require('merge')\n  , proto = require('./proto');\n\n/**\n * create a new dispatcher with `el`.\n *\n * example:\n *\n *      var k = require('k')(window);\n *      k('shift + tab', function(){});\n *\n * @param {Element} el\n * @return {Function}\n */\n\nmodule.exports = function(el){\n  function k(e, fn){ k.handle(e, fn) };\n  k._handle = proto.handle.bind(k);\n  k._clear = proto.clear.bind(k);\n  event.bind(el, 'keydown', k._handle, false);\n  event.bind(el, 'keyup', k._clear, false);\n  event.bind(el, 'focus', k._clear, false);\n  k.listeners = {};\n  merge(k, proto);\n  k.el = el;\n  return k;\n};\n//@ sourceURL=yields-k/index.js"
));
require.register("yields-k/proto.js", Function("exports, require, module",
"\n/**\n * dependencies\n */\n\nvar keycode = require('keycode');\n\n/**\n * modifiers.\n */\n\nvar modifiers = {\n  91: 'command',\n  16: 'shift',\n  17: 'ctrl',\n  18: 'alt'\n};\n\n/**\n * handle the given `KeyboardEvent` or bind\n * a new `keys` handler.\n *\n * @param {String|KeyboardEvent} e\n * @param {Function} fn\n */\n\nexports.handle = function(e, fn){\n  var all = this.listeners[e.which]\n    , len = all && all.length\n    , ignore = this.ignore\n    , invoke = true\n    , handle\n    , mods\n    , mlen;\n\n  // bind\n  if (fn) return this.bind(e, fn);\n\n  // modifiers\n  if (modifiers[e.which]) {\n    this[modifiers[e.which]] = true;\n    this.modifiers = true;\n    return;\n  }\n\n  // ignore\n  if (ignore && ignore(e)) return;\n\n  // match\n  for (var i = 0; i < len; ++i) {\n    invoke = true;\n    handle = all[i];\n    mods = handle.mods;\n    mlen = mods.length;\n\n    for (var j = 0; j < mlen; ++j) {\n      if (!this[mods[j]]) {\n        invoke = null;\n        continue;\n      }\n    }\n\n    invoke && handle.fn(e);\n  }\n};\n\n/**\n * destroy this `k` dispatcher instance.\n */\n\nexports.destroy = function(){\n  event.unbind(this.el, 'keydown', this._handle);\n  event.unbind(this.el, 'keyup', this._clear);\n  event.unbind(this.el, 'focus', this._clear);\n  this.listeners = {};\n};\n\n/**\n * unbind the given `keys` with optional `fn`.\n *\n * example:\n *\n *      k.unbind('enter, tab', myListener); // unbind `myListener` from `enter, tab` keys\n *      k.unbind('enter, tab'); // unbind all `enter, tab` listeners\n *      k.unbind(); // unbind all listeners\n *\n * @param {String} keys\n * @param {Function} fn\n * @return {self}\n */\n\nexports.unbind = function(keys, fn){\n  if (keys) {\n    var index, key;\n    keys = keys.split(/ *, */);\n    for (var i = 0, len = keys.length; i < len; ++i) {\n      key = keycode(keys[i]);\n      if (fn) {\n        index = this.listeners[key].indexOf(fn);\n        this.listeners[key].splice(i, 1);\n      } else {\n        this.listeners[key] = [];\n      }\n    }\n  } else {\n    this.listeners = {};\n  }\n  return this;\n};\n\n/**\n * bind the given `keys` to `fn`.\n *\n * example:\n *\n *      k.bind('shift + tab, ctrl + a', function(e){});\n *\n * @param {String} keys\n * @param {Function} fn\n * @return {self}\n */\n\nexports.bind = function(keys, fn){\n  var fns = this.listeners\n    , mods = []\n    , key;\n\n  // support `,`\n  var all = ',' != keys\n    ? keys.split(/ *, */)\n    : [','];\n\n  for (var i = 0, len = all.length; i < len; ++i) {\n    if ('' == all[i]) continue;\n    mods = all[i].split(/ *\\+ */);\n    key = keycode(mods.pop() || ',');\n    if (!fns[key]) fns[key] = [];\n    fns[key].push({ mods: mods, fn: fn });\n  }\n\n  return this;\n};\n\n/**\n * clear all modifiers on `keyup`.\n */\n\nexports.clear = function(e){\n  var code = e.keyCode;\n  if (!(code in modifiers)) return;\n  this[modifiers[code]] = null;\n  this.modifiers = this.command\n    || this.shift\n    || this.ctrl\n    || this.alt;\n};\n\n/**\n * Ignore all input elements by default.\n * \n * @param {Event} e\n * @return {Boolean}\n */\n\nexports.ignore = function(e){\n  var el = e.target || e.srcElement;\n  var name = el.tagName.toLowerCase();\n  return 'textarea' == name\n    || 'select' == name\n    || 'input' == name;\n};\n//@ sourceURL=yields-k/proto.js"
));
require.register("editable/index.js", Function("exports, require, module",
"\n/**\n * dependencies\n */\n\nvar History = require('history')\n  , emitter = require('emitter')\n  , events = require('events');\n\n/**\n * export `Editable`.\n */\n\nmodule.exports = Editable;\n\n/**\n * Initialize new `Editable`.\n * \n * @param {Element} el\n * @param {Array} stack\n */\n\nfunction Editable(el, stack){\n  var self = this instanceof Editable;\n  if (!self) return new Editable(el, stack);\n  if (!el) throw new TypeError('expects an element');\n  this.history = new History(stack || []);\n  this.history.max(100);\n  this.events = events(el, this);\n  this.el = el;\n}\n\n/**\n * mixins.\n */\n\nemitter(Editable.prototype);\n\n/**\n * Get editable contents.\n * \n * @return {String}\n */\n\nEditable.prototype.contents = function(){\n  return this.el.innerHTML;\n};\n\n/**\n * Toggle editable state.\n * \n * @return {Editable}\n */\n\nEditable.prototype.toggle = function(){\n  return 'true' == this.el.contentEditable\n    ? this.disable()\n    : this.enable();\n};\n\n/**\n * Enable editable.\n * \n * @return {Editable}\n */\n\nEditable.prototype.enable = function(){\n  this.el.contentEditable = true;\n  this.events.bind('keyup', 'onstatechange');\n  this.events.bind('click', 'onstatechange');\n  this.events.bind('focus', 'onstatechange');\n  this.events.bind('paste', 'onchange');\n  this.events.bind('input', 'onchange');\n  this.emit('enable');\n  return this;\n};\n\n/**\n * Disable editable.\n * \n * @return {Editable}\n */\n\nEditable.prototype.disable = function(){\n  this.el.contentEditable = false;\n  this.events.unbind();\n  this.emit('disable');\n  return this;\n};\n\n/**\n * Get range.\n * \n * TODO: x-browser\n * \n * @return {Range}\n */\n\nEditable.prototype.range = function(){\n  return document.createRange();\n};\n\n/**\n * Get selection.\n * \n * TODO: x-browser\n * \n * @return {Selection}\n */\n\nEditable.prototype.selection = function(){\n  return window.getSelection();\n};\n\n/**\n * Undo.\n * \n * @return {Editable}\n */\n\nEditable.prototype.undo = function(){\n  var buf = this.history.prev();\n  this.el.innerHTML = buf || this.el.innerHTML;\n  buf || this.emit('state');\n  return this;\n};\n\n/**\n * Redo.\n * \n * @return {Editable}\n */\n\nEditable.prototype.redo = function(){\n  var buf = this.history.next();\n  var curr = this.el.innerHTML;\n  this.el.innerHTML = buf || curr;\n  buf || this.emit('state');\n  return this;\n};\n\n/**\n * Execute the given `cmd` with `val`.\n * \n * @param {String} cmd\n * @param {Mixed} val\n * @return {Editable}\n */\n\nEditable.prototype.execute = function(cmd, val){\n  document.execCommand(cmd, false, val);\n  this.onstatechange();\n  return this;\n};\n\n/**\n * Query `cmd` state.\n * \n * @param {String} cmd\n * @return {Boolean}\n */\n\nEditable.prototype.state = function(cmd){\n  var length = this.history.vals.length - 1\n    , stack = this.history;\n\n  if ('undo' == cmd) return 0 < stack.i;\n  if ('redo' == cmd) return length > stack.i;\n  return document.queryCommandState(cmd);\n};\n\n/**\n * Emit `state`.\n * \n * @param {Event} e\n * @return {Editable}\n * @api private\n */\n\nEditable.prototype.onstatechange = function(e){\n  this.emit('state', e);\n  return this;\n};\n\n/**\n * Emit `change` and push current `buf` to history.\n * \n * @param {Event} e\n * @return {Editable}\n * @api private\n */\n\nEditable.prototype.onchange = function(e){\n  this.history.add(this.contents());\n  return this.emit('change', e);\n};\n//@ sourceURL=editable/index.js"
));
require.alias("component-history/index.js", "editable/deps/history/index.js");
require.alias("component-history/index.js", "history/index.js");

require.alias("component-emitter/index.js", "editable/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-events/index.js", "editable/deps/events/index.js");
require.alias("component-events/index.js", "events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-event-manager/index.js", "component-events/deps/event-manager/index.js");

require.alias("yields-k/index.js", "editable/deps/k/index.js");
require.alias("yields-k/proto.js", "editable/deps/k/proto.js");
require.alias("yields-k/index.js", "k/index.js");
require.alias("yields-keycode/index.js", "yields-k/deps/keycode/index.js");

require.alias("component-event/index.js", "yields-k/deps/event/index.js");

require.alias("yields-merge/index.js", "yields-k/deps/merge/index.js");

require.alias("editable/index.js", "editable/index.js");

