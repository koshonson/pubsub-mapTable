const LogFilter = function (emitter, target_id = 'radio-filter') {
  this.emitter = emitter;
  this.el = document.getElementById(target_id);
};

LogFilter.prototype.bindRadioInputs = function () {
  this.radios = document.querySelectorAll('.radio');
};

LogFilter.prototype.bindListeners = function (cb) {
  this.bindRadioInputs();
  if (!this.radios) return;
  this.radios.forEach(radio => {
    radio.addEventListener('change', cb);
  });
};

const filter = new LogFilter(emitter);
filter.bindListeners(e => emitter.emit('log-filter', e.target.value));
