import * as d3 from "d3";
import { getActualDim } from "./utils";

let StackedArea = {
  data: null,
  width: null,
  height: null,
  selector: null,
};

Object.defineProperties(StackedArea, {
  init(selector, data) {
    this.selector = selector;
    this.data = data;
    const rect = getActualDim(selector);
    this.width = rect[0];
    this.height = rect[1];
  },
  draw() {
    let svg = d3.select(selector).data(data);
  },
});

export { StackedArea };
