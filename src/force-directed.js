import * as d3 from 'd3'
let _width = 1000;
let _height = 1000;
let width = _width;
let height = _height;

let data = null;
let data_file = './data/data.json';

    const svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'chart')

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

    const simulationLinks = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', d => '#c2c2c2')

    const simulationNodes = svg.append('g')
        .attr('fill', '#fff')
        .attr('stroke', '#000')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', 3.5)
        .attr('fill', d => d.children ? null : '#000') 
        .attr('stroke', d => d.children ? null : '#fff')
        .call(d3.drag()
            .on('start', started)
            .on('drag', dragged)
            .on('end', ended)
        )

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
        simulationLinks.attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)

        simulationNodes.attr('cx', d => d.x)
            .attr('cy', d => d.y)
    }



    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    let links = data.links;
    let nodes = data.nodes;

    for (i in nodes) {
    	nodes_idx_dict[nodes[i].id] = i;
        nodes_dict[nodes[i].id] = nodes[i];
    }

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

    graph_layout_algorithm(nodes, links)

    link
        .attr("x1", d => nodes_dict[d.source].x)
        .attr("y1", d => nodes_dict[d.source].y)
        .attr("x2", d => nodes_dict[d.target].x)
        .attr("y2", d => nodes_dict[d.target].y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    text
        .attr("x", d => d.x)
        .attr("y", d => d.y)
}

function main() {
    d3.json(data_file).then(function (DATA) {
        data = DATA;
        draw_graph();
    })
}

main()
