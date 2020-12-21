import * as d3 from "d3";

let StackedArea = {
  data: null,
  width: null,
  height: null,
  selector: null,
};

Object.defineProperties(StackedArea, {
  rect: {
    get() {
      return [this.height, this.width];
    },
    set(rect) {
      this.height = rect.height;
      this.width = rect.width;
    },
  },
  init(selector, data, rect) {
    this.selector = selector;
    this.data = data;
    this.rect = rect;
  },
  draw() {
    let svg = d3.select(selector).data(data);
  },
});

export { StackedArea };
