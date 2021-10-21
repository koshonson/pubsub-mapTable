emitter.emit('general-logs', 'Main app loaded.');

// add Map
const map = new Map(emitter);
map.init();
map.addVectorLayer(TABLE_DATA.features);
map.markerHover();
map.markerClick();

map.emitter.on('row-hovered', map.highlightMarker.bind(map));
map.emitter.on('state-set', map.selectMarkers.bind(map));

// add Table
const tableData = arrayFromObjectsToRow(TABLE_DATA.features.map(({ attrs }) => ({ ...attrs })));
const table = new Table(tableData, emitter);
table.addColumn(() => ({ strategy: 'checkbox' }));
table.render();

table.emitter.on('marker-hovered', table.highlightRow);
table.emitter.on('state-set', table.selectRows.bind(table));

// add State
const state = new State(emitter);
const [getSelection, setSelection] = state.useState('selection', []);
state.emitter.on('row-selected', (_id, bool) => {
  const selection = getSelection();
  if (bool) {
    selection.push(_id);
    setSelection(selection);
  } else {
    setSelection(selection.filter(id => id !== _id));
  }
});
state.emitter.on('marker-selected', (id, bool) => {
  const selection = getSelection();
  if (!bool) {
    return setSelection(selection.filter(storedId => storedId !== '' + id));
  }
  selection.push('' + id);
  return setSelection(selection);
});
