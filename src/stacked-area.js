import * as d3 from "d3";
import { map } from "d3";
import { getActualDim } from "./utils";

const ATTRX = "Institution Index";
const ATTRG = "Ph.D. Graduation Year";
const ATTRY = "H-index";
const CURRENTY = 2020;

let idToIdx = new Map();

function StackedArea(selector) {
  this.selector = selector;
  [this.width, this.height] = getActualDim(selector);
  this.svg = d3
    .select(selector)
    .attr("viewBox", [0, 0, this.width, this.height]);
}

function groupData(data, ymin = 1950, ymax = 2020) {
  data = data.filter((d) => d[ATTRG] > ymin && d[ATTRG] <= ymax);
  for (let d of data) {
    d.group = Math.floor((5 * (ymax - d[ATTRG])) / (ymax - ymin));
  }
  let yticks = [0, 1, 2, 3, 4].map((i) =>
    Math.round(CURRENTY - ymax + ((ymax - ymin) * i) / 5)
  );
  for (const i of [0, 1, 2, 3]) {
    yticks[i] = `${yticks[i]}-${yticks[i + 1]}`;
  }
  yticks[4] = `${yticks[4]}+`;
  let series = [];
  let map = new Map();
  for (const d of data) {
    if (map.has(d[ATTRX])) continue;
    let node = { x: d[ATTRX] };
    for (let i of yticks) {
      node[i] = 0;
    }
    map.set(d[ATTRX], series.length);
    series.push(node);
  }
  for (const d of data) {
    let idx = map.get(d[ATTRX]);
    let tick = yticks[d.group];
    series[idx][tick] += 1.0 * d[ATTRY];
  }
  return d3
    .stack()
    .keys(yticks)(series)
    .map((d) => (d.forEach((v) => (v.key = d.key)), d));
}

StackedArea.prototype.init = function (data, ymin = 1950, ymax = 2020) {
  const [width, height] = [this.width, this.height];
  const margin = { top: 10, right: 10, bottom: 20, left: 40 };
  const svg = this.svg;
  for (const d of data) {
    idToIdx.set(d["Institution"], d[ATTRX]);
  }
  let series = groupData(data);
  let x = d3
    .scaleBand()
    .domain(data.map((d) => d[ATTRX]).sort((a, b) => 1.0 * a - 1.0 * b))
    .range([margin.left, width - margin.right])
    .padding(0.1);
  let y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
    .rangeRound([height - margin.bottom, margin.top]);
  let color = d3
    .scaleOrdinal()
    .domain(series.map((d) => d.key))
    .range(d3.schemeAccent)
    .unknown("#ccc");
  let xAxis = (g) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call((g) => g.selectAll(".domain").remove());
  let yAxis = (g) =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call((g) => g.selectAll(".domain").remove());
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d, i) => x(d.data.x))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth());
};

StackedArea.prototype.update = function (data, ymin, ymax) {
  this.svg.selectAll("g").remove();
  this.init(data, ymin, ymax);
};

StackedArea.prototype.highlight = function (d) {
  this.svg
    .selectAll("rect")
    .attr("opacity", (f) => (f.data.x == idToIdx.get(d.id) ? 1.0 : 0.5));
};

StackedArea.prototype.releave = function () {
  this.svg.selectAll("rect").attr("opacity", 1.0);
};

export { StackedArea };
