function getActualDim(selector) {
  const element = document.querySelector(selector);
  const width = Math.min(element.clientWidth, element.scrollWidth);
  const height = Math.min(element.clientHeight, element.scrollHeight);
  return [width, height];
}

function getMinMax(data, attr) {
  let min = 1e9,
    max = 0;
  data.forEach((d) => {
    let v = parseInt(d[attr]);
    if (v > max) max = v;
    if (v < min) min = v;
  });
  return [min, max];
}

function boundValue(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export { getActualDim, getMinMax, boundValue };
