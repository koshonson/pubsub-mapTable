// Logger class
const Logger = function (emitter, target_id = 'console') {
  this.emitter = emitter;
  this.el = document.getElementById(target_id);
  this.logs = [];
  this.logCfg = {
    prefix: '>',
    delimiter: ' ',
    parts: {
      ts: true,
      target: true,
      channel: true,
      msg: true
    }
  };
};

Logger.prototype.parseChannel = function (channel) {
  return channel.split(':');
};

Logger.prototype.buildLog = {
  'general-logs': ({ target, channel, ts, args }) => {
    const [msg] = args;
    return { target, channel, msg, ts };
  },
  'marker-hovered': ({ target, channel, ts, args }) => {
    const [[id, bool]] = args;
    const msg = `Marker ${id} ${bool ? 'gained' : 'lost'} hover.`;
    return { target, channel, msg, ts };
  },
  'marker-selected': ({ target, channel, ts, args }) => {
    const [[id, bool]] = args;
    const msg = `Marker ${id} was ${bool ? 'selected' : 'removed from selection'}.`;
    return { target, channel, msg, ts };
  },
  'row-hovered': ({ target, channel, ts, args }) => {
    const [[id, bool]] = args;
    const msg = `Row ${id} ${bool ? 'gained' : 'lost'} hover.`;
    return { target, channel, msg, ts };
  },
  'row-selected': ({ target, channel, ts, args }) => {
    const [[id, bool]] = args;
    const msg = `Marker ${id} was ${bool ? 'selected' : 'removed from selection'}.`;
    return { target, channel, msg, ts };
  }
};

Logger.prototype.log = function (_channel, ...args) {
  const ts = this.timestamp();
  const [target, channel] = this.parseChannel(_channel);
  const log = this.buildLog[channel]({ target, channel, ts, args: [...args] });
  if (!this.logs.length || this.logIsNew(log)) {
    this.logs.unshift(log);
  }
  this.printLogs();
};

Logger.prototype.logIsNew = function (log) {
  const [lastLog] = this.logs.slice(0, 1);
  if (lastLog.target !== log.target) return true;
  if (lastLog.channel !== log.channel) return true;
  if (lastLog.msg !== log.msg) return true;
  return false;
};

Logger.prototype.formatMsg = function (str, key) {
  const formatters = {
    ts: str => str,
    target: str => str + ' component',
    channel: str => 'on ' + str + ' channel:',
    msg: str => str
  };
  return formatters[key](str);
};

Logger.prototype.printLog = function (_log, config = this.logCfg) {
  const log = [];
  Object.keys(config.parts).forEach(key => {
    if (config.parts[key]) {
      const msg = this.formatMsg(_log[key], key);
      log.push(msg);
    }
  });
  if (!log.length) return;
  log.unshift(config.prefix);
  return log.join(config.delimiter);
};

Logger.prototype.printLogs = function () {
  this.el.innerText = '';
  const filtered = this.logs.map(log => log);
  filtered.forEach(log => {
    const p = document.createElement('p');
    p.innerText = this.printLog(log);
    this.el.append(p);
  });
};

Logger.prototype.timestamp = function () {
  const date = new Date();
  const y = date.getFullYear();
  const m = ('0' + (date.getMonth() + 1)).slice(-2);
  const d = ('0' + date.getDate()).slice(-2);
  const H = ('0' + date.getHours()).slice(-2);
  const M = ('0' + date.getHours()).slice(-2);
  const S = ('0' + date.getSeconds()).slice(-2);

  return `${y}-${m}-${d} ${H}:${M}:${S}`;
};

// Logger initialization and setup
const logger = new Logger(emitter);

logger.emitter.on(
  'general-logs',
  (msg => {
    logger.log('app:general-logs', msg);
  }).bind(logger)
);

logger.emitter.on(
  'marker-hovered',
  ((...e) => {
    logger.log('map:marker-hovered', e);
  }).bind(logger)
);

logger.emitter.on(
  'marker-selected',
  ((...e) => {
    logger.log('map:marker-selected', e);
  }).bind(logger)
);

logger.emitter.on(
  'row-hovered',
  ((...e) => {
    logger.log('table:row-hovered', e);
  }).bind(logger)
);

logger.emitter.on(
  'row-selected',
  ((...e) => {
    logger.log('table:row-selected', e);
  }).bind(logger)
);

emitter.emit('general-logs', 'Emitter initialized.');
emitter.emit('general-logs', 'Logger component loaded.');
