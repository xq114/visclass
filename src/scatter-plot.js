import * as d3 from "d3";
import { getActualDim, countDistinct } from "./utils";

const ATTRX = "Institution Index";
const ATTRY = "H-index";

function ScatterPlot(selector) {
  this.selector = selector;
  [this.width, this.height] = getActualDim(selector);
  this.svg = d3
    .select(selector)
    .attr("viewBox", [0, 0, this.width, this.height]);
}

ScatterPlot.prototype.init = function (data) {
  const [width, height] = [this.width, this.height];
  const margin = { top: 10, right: 10, bottom: 20, left: 40 };
  const svg = this.svg;
  let domainx = countDistinct(data, ATTRX).sort((a, b) => 1.0 * a - 1.0 * b);
  let rw = (0.7 * (width - margin.left - margin.right)) / (domainx.length + 1);
  let x = d3
    .scaleBand()
    .domain(domainx)
    .range([margin.left, width - margin.right])
    .padding(0.1);
  let y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => 1.0 * d[ATTRY])])
    .rangeRound([height - margin.bottom, margin.top]);
  let xAxis = (g) =>
    g.attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call((g) => g.selectAll(".domain").remove());
  let yAxis = (g) =>
    g.attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(10))
      .call((g) => g.selectAll(".domain").remove());
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("fill", "var(--bs-blue)")
    .attr("cx", (d) => x(d[ATTRX]) + Math.random() * rw)
    .attr("cy", (d) => y(d[ATTRY]))
    .attr("r", (d) => 1.5);
};

ScatterPlot.prototype.update = function (data) {};

export { ScatterPlot };
