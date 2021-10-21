emitter.emit('general-logs', 'State component loaded.');

const State = function (emitter, target_id = 'selection') {
  this.emitter = emitter;
  this.el = document.getElementById(target_id);
  this.store = {};
};

State.prototype.useState = function (name, initialValue) {
  const self = this;
  this.store[name] = initialValue;
  const set = function (value) {
    return self.setState(name, value);
  };
  const get = function () {
    return self.getState(name);
  };
  return [get, set];
};

State.prototype.setState = function (name, value) {
  if (!this.store[name]) {
    return console.warn(`Store key of ${name} wasn't initialized. Use useState method.`);
  }
  this.store[name] = value;
  this.emitter.emit('state-set', name, this.store[name]);
  this.display();
  return value;
};

State.prototype.getState = function (name) {
  return this.store[name];
};

State.prototype.display = function () {
  this.el.innerText = '';
  this.store.selection.forEach(id => {
    const div = document.createElement('div');
    div.classList.add('selected-id');
    div.innerText = id;
    this.el.append(div);
  });
};
