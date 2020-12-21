function getActualDim(selector) {
  const element = document.getElementByQuerySelector(selector);
  const height = Math.min(element.clientHeight, element.scrollHeight);
  const width = Math.min(element.clientWidth, element.scrollWidth);
  return [height, width];
}

function run(faculties, linkes) {}

export { run };
