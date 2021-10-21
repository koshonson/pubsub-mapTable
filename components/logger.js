const parseChannel = function (channel) {
  return channel.split('-');
};

const toUpperCase = function (string) {
  return string.slice(0, 1).toUpperCase() + string.slice(1);
};

const hoveredOrSelectedTemplate = ({ target, channel, ts, args }) => {
  const msgBoolStatus = {
    hovered: { add: 'gained', remove: 'lost' },
    selected: { add: 'selected', remove: 'removed from selection' }
  };
  const msgTemplates = {
    hovered: (subject, id, bool) => `${toUpperCase(subject)} ${id} ${bool} hover.`,
    selected: (subject, id, bool) => `${toUpperCase(subject)} ${id} was ${bool}.`
  };
  return (() => {
    const [subject, action] = parseChannel(channel);
    const [[id, bool]] = args;
    const status = bool ? 'add' : 'remove';
    const msg = msgTemplates[action](subject, id, msgBoolStatus[action][status]);

    return { target, channel, msg, ts };
  })();
};

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

Logger.prototype.parseTarget = function (fullname) {
  return fullname.split(':');
};

Logger.prototype.buildLog = {
  'general-logs': ({ target, channel, ts, args }) => {
    const [msg] = args;
    return { target, channel, msg, ts };
  },
  'marker-hovered': log => hoveredOrSelectedTemplate(log),
  'marker-selected': log => hoveredOrSelectedTemplate(log),
  'row-hovered': log => hoveredOrSelectedTemplate(log),
  'row-selected': log => hoveredOrSelectedTemplate(log)
};

Logger.prototype.log = function (_channel, ...args) {
  const ts = this.timestamp();
  const [target, channel] = this.parseTarget(_channel);
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

const channelClassification = {
  marker: 'map',
  row: 'table'
};

logger.emitter.on(
  'general-logs',
  (msg => {
    logger.log('app:general-logs', msg);
  }).bind(logger)
);

['marker-hovered', 'marker-selected', 'row-hovered', 'row-selected'].forEach(channel => {
  logger.emitter.on(
    channel,
    ((...e) => {
      const subject = channel.split('-')[0];
      const fullname = `${channelClassification[subject]}:${channel}`;
      logger.log(fullname, e);
    }).bind(logger)
  );
});

emitter.emit('general-logs', 'Emitter initialized.');
emitter.emit('general-logs', 'Logger component loaded.');
