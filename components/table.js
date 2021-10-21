emitter.emit('general-logs', 'Table component loaded.');

const arrayFromObjectsToRow = arr => {
  const _rows = [Object.keys(arr[0])];
  return arr.reduce((rows, row) => {
    rows.push(Object.values(row));
    return rows;
  }, _rows);
};

const createCbCell = () => ({ strategy: 'checkbox' });

const Table = function (data, emitter, target_id = 'table') {
  this.data = data;
  this.emitter = emitter;
  this.el = document.getElementById(target_id);
};

Table.prototype.paint = {
  table: () => $el('table', { class: 'table', id: 'table' }),
  tr: id => $el('tr', { class: 'table-row', id }),
  th: () => $el('th', { class: ['cell', 'head-cell', 'flex-center'] }),
  td: () => $el('td', { class: ['cell', 'flex-center'] }),
  cb: () => $el('input', { type: 'checkbox' })
};

Table.prototype.paintStrategy = function () {
  const self = this;
  return {
    default: function defaultPaintStrategy(cell, item) {
      cell.innerText = item;
      return cell;
    },
    checkbox: function checkboxPaintStrategy(cell, idx, row) {
      if (!idx) return cell;
      const cb = self.paint.cb();
      cb.id = `cb-${row.id}`;
      cb.addEventListener('change', e => {
        self.emitter.emit('row-selected', row.id, e.target.checked);
      });
      cell.append(cb);
      return cell;
    }
  };
};

Table.prototype.mapData = function (cb) {
  return this.data.map(row => cb(row));
};

Table.prototype.paintTable = function () {
  const table = this.paint.table();
  this.data.forEach((rowData, idx) => {
    const type = idx === 0 ? 'head' : undefined;
    const row = this.paintRow(rowData, type, idx);
    table.append(row);
  });
  return table;
};

Table.prototype.paintRow = function (data, head = false, idx) {
  const row = this.paint.tr(data[1]);
  this.bindListener(row, 'mouseenter', e => {
    this.emitter.emit('row-hovered', e.target.id, true);
    row.classList.add('table-row-hovered');
  });
  this.bindListener(row, 'mouseleave', e => {
    this.emitter.emit('row-hovered', e.target.id, false);
    row.classList.remove('table-row-hovered');
  });

  const type = head === 'head' ? 'th' : 'td';
  data.forEach(item => {
    let cell = this.paint[type]();
    cell = item.strategy
      ? this.paintStrategy()[item.strategy](cell, idx, row)
      : this.paintStrategy().default(cell, item);
    row.append(cell);
  });
  return row;
};

Table.prototype.addColumn = function (cellGen) {
  this.data = this.mapData(row => [cellGen(), ...row]);
};

Table.prototype.render = function () {
  this.el.append(this.paintTable());
};

Table.prototype.bindListener = function (el, ev, cb) {
  el.addEventListener(ev, cb);
};

Table.prototype.highlightRow = function (id, bool) {
  const row = document.getElementById(id);
  if (bool) {
    row.classList.add('table-row-hovered');
  } else {
    row.classList.remove('table-row-hovered');
  }
};

Table.prototype.selectRows = function (name, selection) {
  this.data.forEach(item => {
    const id = item[1];
    const el = document.getElementById(id);
    const cb = id !== 'id' ? document.getElementById(`cb-${id}`) : null;
    if (selection.includes('' + id)) {
      el.classList.add('table-row-selected');
      if (cb) cb.checked = true;
    } else {
      el.classList.remove('table-row-selected');
      if (cb) cb.checked = false;
    }
  });
};
