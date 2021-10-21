const Emitter = function () {};

Emitter.prototype.on = function (type, cb) {
  if (!this[type]) this[type] = [];
  this[type].push(cb);
};

Emitter.prototype.emit = function (type, ...args) {
  if (!this[type] || !this[type].length) return;
  this[type].forEach(cb => cb(...args));
};

const emitter = new Emitter();
