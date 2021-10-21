emitter.emit('general-logs', 'Map component loaded.');

const Map = function (emitter, target_id = 'map') {
  this.ol = ol;
  this.el = document.getElementById(target_id);
  this.emitter = emitter;
  this.sources = [];
  this.selection = [];
};

const VectorLayer = ol.layer.Vector;
const VectorSource = ol.source.Vector;

const circleStyle = function (radius = 10, color = 'red') {
  return new ol.style.Circle({
    radius,
    fill: new ol.style.Fill({
      color
    }),
    stroke: new ol.style.Stroke({
      color: 'black',
      width: 2
    })
  });
};

const newPoint = function (lon, lat) {
  return new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
  });
};

Map.prototype.init = function () {
  this.map = new this.ol.Map({
    target: this.el,
    layers: [new this.ol.layer.Tile({ source: new ol.source.OSM() })],
    view: new this.ol.View({
      center: ol.proj.fromLonLat([14.45, 50.1]),
      zoom: 10,
      projection: 'EPSG:3857'
    })
  });
};

Map.prototype.addVectorLayer = function (data) {
  const source = this.createPointLayer(data);
  const layer = new VectorLayer({
    source,
    style: new ol.style.Style({
      image: circleStyle(),
      zIndex: Infinity
    })
  });
  this.map.addLayer(layer);
  this.sources.push(source);
  return [layer, source];
};

Map.prototype.createPointLayer = function (data) {
  const vs = new VectorSource();
  for (let { coords: c, attrs: a } of data) {
    const feature = newPoint(c.lon, c.lat);
    feature.setId(a.id);
    feature.setProperties(a);
    vs.addFeature(feature);
  }
  return vs;
};

Map.prototype.markerHover = function () {
  const self = this;
  let hovered = null;
  const highlightFeature = function (event) {
    const featureList = self.getFeatureFromEvent(event);
    if (featureList) {
      const [feature] = featureList;
      if (hovered && hovered !== feature) {
        self.highlightMarker(hovered.getId(), false);
        self.emitter.emit('marker-hovered', hovered.getId(), false);
      }
      hovered = feature;
      self.highlightMarker(hovered.getId(), true);
      self.emitter.emit('marker-hovered', feature.getId(), true);
    } else {
      if (hovered) {
        self.highlightMarker(hovered.getId(), false);
        self.emitter.emit('marker-hovered', hovered.getId(), false);
        hovered = null;
      }
    }
  };
  this.pointerMove([highlightFeature]);
};

Map.prototype.markerClick = function () {
  const self = this;
  const selectMarker = function (event) {
    const featureList = self.getFeatureFromEvent(event);
    if (featureList) {
      const [feature] = featureList;
      const id = feature.getId();
      const bool = self.selection.includes('' + id);
      self.emitter.emit('marker-selected', id, !bool);
    }
  };
  this.map.on('click', selectMarker);
};

Map.prototype.pointerMove = function (cbs) {
  for (let cb of cbs) {
    this.map.on('pointermove', cb);
  }
};

Map.prototype.getFeatureFromEvent = function (event) {
  const pixel = this.map.getPixelFromCoordinate(event.coordinate);
  const feature = this.map.getFeaturesAtPixel(pixel);
  return feature;
};

Map.prototype.highlightMarker = function (id, bool) {
  const f = this.sources[0].getFeatureById(id);
  if (!f) return;
  if (bool) {
    f.setStyle(
      new ol.style.Style({
        image: circleStyle(10, 'green'),
        zIndex: Infinity
      })
    );
  } else {
    if (this.selection.includes('' + f.getId())) {
      f.setStyle(
        new ol.style.Style({
          image: circleStyle(10, 'limegreen'),
          zIndex: Infinity
        })
      );
    } else {
      f.setStyle(
        new ol.style.Style({
          image: circleStyle(),
          zIndex: Infinity
        })
      );
    }
  }
};

Map.prototype.selectMarkers = function (name, selection) {
  const self = this;
  const src = this.sources[0];
  const fetaures = src.getFeatures();
  this.selection = [...selection];
  fetaures.forEach(feature => {
    if (self.selection.includes('' + feature.getId())) {
      feature.setStyle(
        new ol.style.Style({
          image: circleStyle(10, 'limegreen'),
          zIndex: Infinity
        })
      );
    } else {
      feature.setStyle(
        new ol.style.Style({
          image: circleStyle(),
          zIndex: Infinity
        })
      );
    }
  });
};
