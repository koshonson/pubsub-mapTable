console.log('utils.js loaded');

const addStrategy = {
  default: (e, k, v) => (e[k] = v),
  class: (e, k, v) => {
    if (Array.isArray(v)) {
      e.classList.add(...v);
    } else {
      e.classList.add(v);
    }
  }
};

const addOption = (e, k, v) => {
  return addStrategy[k] ? addStrategy[k](e, k, v) : addStrategy.default(e, k, v);
};

const $el = function (_el, options) {
  const el = document.createElement(_el);
  Object.entries(options).forEach(([key, value]) => {
    addOption(el, key, value);
  });
  return el;
};
