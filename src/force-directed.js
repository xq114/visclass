import * as d3 from 'd3'



let data = null;
let data_file = './data/data.json';
function force-directed(selector) {
  this.selector = selector;
  [this.width, this.height] = getActualDim(selector);
  this.svg = d3
    .select(selector)
    .attr("viewBox", [0, 0, this.width, this.height]);
}



force-directed.prototype.init = function (data) {
  const [width, height] = [this.width, this.height];
  const margin = { top: 10, right: 10, bottom: 20, left: 40 };
  const svg = this.svg;
    let links = data.links;
    let nodes = data.nodes;

    let link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.weight));

    let node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => Math.sqrt(d.weight) * 2 + 0.5)
        .attr("fill", "steelblue")
        .on("mouseover", function (e, d) {
            text
                .attr("display", function (f) {
                    if (f.id == d.id || f.weight > 40) {
                        return "null";
                    }
                    else {
                        return "none";
                    }
                })
        })
        .on("mouseout", function (e, d) {
            text
                .attr("display", function (f) {
                    if (f.weight > 40) {
                        return 'null';
                    }
                    else {
                        return 'none';
                    }
                })
        });
        .call(d3.drag()
                .on('start', started)
                .on('drag', dragged)
                .on('end', ended)
            )

    let text = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.id)
        .attr("display", function (d) {
            if (d.weight > 40) {
                return 'null';
            }
            else {
                return 'none';
            }
        });
    const simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody())
        .force('link', d3.forceLink(links))
        .force('x', d3.forceX(width / 2))
        .force('y', d3.forceY(height / 2))

    simulation.alphaDecay(0.05)
    simulation.force('charge')
        .strength(-50)
    simulation.force('link')
        .id(d => d.id) 
        .distance(0) 
        .strength(1) 
        .iterations(1) 

    

    function started(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(.2).restart()
        }
        d.fx = d.x 
        d.fy = d.y
    }

    function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
    }

    function ended(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0)
        }
        d.fx = null
        d.fy = null
    }

    simulation.on('tick', ticked)

    function ticked() {
       link.attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)

        node.attr('cx', d => d.x)
            .attr('cy', d => d.y)
    }

 }
force-directed.prototype.update = function (data) {};
             
   export{force-directed}
