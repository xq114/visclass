import * as d3 from "d3";
import { getActualDim } from "./utils";

function ForceDirected(selector) {
  this.selector = selector;
  [this.width, this.height] = getActualDim(selector);
  this.svg = d3
    .select(selector)
    .attr("viewBox", [0, 0, this.width, this.height]);
}

ForceDirected.prototype.set_listener = function (func) {
  this.showInfo = func;
  this.svg.selectAll("circle").on("mouseover", (e, d) => {
    this.showInfo(d);
    this.svg
      .selectAll("circle")
      .attr("fill", (f) => (d.id == f.id ? "var(--bs-yellow)" : "var(--bs-blue)"));
  })
};

ForceDirected.prototype.init = function (data) {
  const [width, height] = [this.width, this.height];
  const svg = this.svg;
  let links = data.links;
  let nodes = data.nodes;

  for (const d of nodes) {
    d.x = width / 2 + (Math.random() - 0.5) * 10;
    d.y = height / 2 + (Math.random() - 0.5) * 10;
  }

  const simulation = d3
    .forceSimulation()
    .force("charge", d3.forceManyBody())
    .force("collide", d3.forceCollide())
    .force(
      "link",
      d3.forceLink().id((d) => d.id)
    )
    .force("x", d3.forceX(width * 0.4))
    .force("y", d3.forceY(height * 0.4));

  let link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.weight));

  function started(e, d) {
    if (!e.active) {
      simulation.alphaTarget(0.2).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(e, d) {
    d.fx = e.x;
    d.fy = e.y;
  }

  function ended(e, d) {
    if (!e.active) {
      simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }

  let node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.2)
    .attr("r", (d) => Math.min(Math.sqrt(d.weight) * 2 + 0.5, 4 + Math.log(d.weight)))
    .attr("fill", "var(--bs-blue)")
    .on("mouseover", function (e, d) {
      svg
        .selectAll("circle")
        .attr("fill", (f) => (d.id == f.id ? "var(--bs-yellow)" : "var(--bs-blue)"));
    })
    .on("mouseout", function (e, d) {
      svg.selectAll("circle").attr("fill", "var(--bs-blue)");
    })
    .call(d3.drag().on("start", started).on("drag", dragged).on("end", ended));

  simulation.nodes(nodes);
  simulation.force("link").links(links).distance(0).strength(1).iterations(1);

  simulation.alphaDecay(0.05);
  simulation.force("charge").strength(-100);
  simulation.force("x").strength(0.5);
  simulation.force("y").strength(0.5);
  simulation.force("collide").radius(10);

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  }
  simulation.on("tick", ticked);
};

export { ForceDirected };
