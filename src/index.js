import * as d3 from 'd3';
import * as jQuery from 'jquery';
import saveAs from 'file-saver';
console.log(jQuery);
let $ = jQuery.default;
$ = $ ? $ : jQuery.__moduleExports;

let _width = $(window).width();
let _height = $(window).height();
let width = _width * 0.8;
let height = _height;

let data = null;
let data_file = 'data/data.json';

let vars = { "C": "1", "B": "0.25", "R": "0.01", "T": "500" }

function draw_convergence(dat) {
    let margin = ({ top: 10, right: 15, bottom: 40, left: 40 })
    let ht = 0.5 * height
    let wd = 0.25 * width
    let y = d3.scaleLinear()
        .domain(d3.extent(dat, d => d.value))
        .rangeRound([ht - margin.bottom, margin.top])
    let x = d3.scaleLinear()
        .domain(d3.extent(dat, d => d.id))
        .range([margin.left, wd - margin.right])
    let line = d3.line()
        .x(d => x(d.id))
        .y(d => y(d.value))
    let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(wd / 80).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
    let yAxis = (g, y, format) => g
        .attr("transform", `translate(${margin.left},${height - ht})`)
        .call(d3.axisLeft(y).ticks(ht / 80, format))
        .call(g => g.selectAll(".tick line").clone()
            .attr("stroke-opacity", 0.2)
            .attr("x2", width - margin.left - margin.right))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", -margin.left)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(dat.y))
    const svg = d3.select('#container').select("svg#plot").attr("viewBox", [0, 0.5 * height, 0.25 * width, 0.5 * height]);
    svg.append("g")
        .call(xAxis, x);
    svg.append("g")
        .call(yAxis, y);
    svg.append("path")
        .datum(dat)
        .attr("transform", `translate(0,${height - ht})`)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);
}

// 需要实现一个图布局算法，给出每个node的x,y属性
function graph_layout_algorithm(nodes, links) {
    // console.log("nodes:", nodes);
    // console.log("links:", links);
    // 算法开始时间
    let d = new Date()
    let begin = d.getTime()

    //这是一个随机布局，请在这一部分实现图布局算法
    const loc = new Map();
    for (let i in nodes) {
        loc.set(nodes[i].id, i);
    }

    const V = nodes.length;
    const E = links.length;
    let weight = new Array(2 * E + 5);
    let to = new Array(2 * E + 5);
    let next = new Array(2 * E + 5);
    let head = new Array(V + 5);
    for (let i in nodes)
        head[i] = -1;
    for (let [k, e] of links.entries()) {
        let i = loc.get(e.source);
        let j = loc.get(e.target);
        if (i === j) continue;
        to[k] = i;
        next[k] = head[j];
        head[j] = k;
        weight[k] = e.weight;
        to[k + E] = j;
        next[k + E] = head[i];
        head[i] = k + E;
        weight[k + E] = e.weight;
    }
    const T = vars.T;

    const A = 0.06 * width * height * vars.C * vars.C; // can be adjusted
    const dt = 0.06;                                   // can be adjusted
    const beta = Math.pow(0.03, 1 / T);                // can be adjusted

    const k = Math.sqrt(A / V);
    function energy(nodes, links) {
        let E = 0;
        for (let n of nodes)
            for (let m of nodes) {
                if (n !== m) {
                    E -= k * k / Math.sqrt((n.x - m.x) * (n.x - m.x) + (n.y - m.y) * (n.y - m.y));
                }
            }
        for (let e of links) {
            let n = nodes[loc.get(e.source)];
            let m = nodes[loc.get(e.target)];
            E += e.weight * ((n.x - m.x) * (n.x - m.x) + (n.y - m.y) * (n.y - m.y)) / k / 2;
        }
        return E / 1000000;
    }

    const B = vars.B;
    let repel = 10 * B;
    function Fx(ni, nodes, links) {
        let n = nodes[ni];
        let Fx = 0;
        for (let i = head[ni]; i >= 0; i = next[i]) {
            let m = nodes[to[i]];
            Fx -= weight[i] * (n.x - m.x) / k;
        }
        for (let m of nodes) {
            if (n !== m) {
                let r2 = ((n.x - m.x) * (n.x - m.x) + (n.y - m.y) * (n.y - m.y));
                let r = Math.sqrt(r2);
                Fx += n.weight * m.weight * k * k * (n.x - m.x) / (r2 * r);
                if (r < (n.r + m.r) * B)
                    Fx += repel * (n.r + m.r - r / B) * (n.x - m.x) / r;
            }
        }
        return Fx;
    }

    function Fy(ni, nodes, links) {
        let n = nodes[ni];
        let Fy = 0;
        for (let i = head[ni]; i >= 0; i = next[i]) {
            let m = nodes[to[i]];
            Fy -= weight[i] * (n.y - m.y) / k;
        }
        for (let m of nodes) {
            if (n !== m) {
                let r2 = ((n.x - m.x) * (n.x - m.x) + (n.y - m.y) * (n.y - m.y));
                let r = Math.sqrt(r2);
                Fy += n.weight * m.weight * k * k * (n.y - m.y) / (r2 * r);
                if (r < (n.r + m.r) * B)
                    Fy += repel * (n.r + m.r - r / B) * (n.y - m.y) / r;
            }
        }
        return Fy;
    }

    function roundX(x, width) {
        return (x > width * 0.9) ? (width * 0.9 + (Math.random() - 0.5) * 0.01) : ((x < width * 0.1) ? (width * 0.1 + (Math.random() - 0.5) * 0.01) : x);
    }

    function roundV(Vx, Vy, ft) {
        let v2 = Vx * Vx + Vy * Vy;
        if (v2 > ft * ft) {
            let ratio = ft / Math.sqrt(v2);
            return [Vx * ratio, Vy * ratio];
        }
        return [Vx, Vy];
    }

    for (let n of nodes) {
        n.r = (Math.sqrt(n.weight) * 2 + 0.5);
        n.x = (Math.random() * 0.8 + 0.1) * width;
        n.y = (Math.random() * 0.8 + 0.1) * height;
    }

    let energies = [];

    let R = vars.R;
    let ft = 0.8 * width;
    for (let t = 0; t < T; ++t) {
        let random = R * t / T * Math.exp(-3 * t / T);
        for (let [ni, n] of nodes.entries()) {
            let Vx = Fx(ni, nodes, links) * dt;
            let Vy = Fy(ni, nodes, links) * dt + (Math.random() - 0.5) * random * height;
            [Vx, Vy] = roundV(Vx, Vy, ft);
            n.x += Vx * dt;
            n.y += Vy * dt;
            n.x = roundX(n.x, width);
            n.y = roundX(n.y, height);
        }
        let e1 = energy(nodes, links);
        for (let n of nodes) {
            n.ox = n.x;
            n.oy = n.y;
            n.x += (Math.random() - 0.5) * random * width;
            n.x += (Math.random() - 0.5) * random * height;
        }
        let e2 = energy(nodes, links);
        if (e2 > e1) {
            for (let n of nodes) {
                n.x = n.ox;
                n.y = n.oy;
            }
            energies.push({ "id": t, "value": e1 });
        }
        else
            energies.push({ "id": t, "value": e2 });
        ft = ft * beta;
    }

    // 算法结束时间
    let d2 = new Date()
    let end = d2.getTime()

    draw_convergence(energies)

    let circles = d3.select('svg#graph').selectAll('circle');
    let linkss = d3.select('svg#graph').selectAll('line');
    let text = d3.select('svg#graph').selectAll("text")
    circles.on('mouseover', (e, d) => {
        let ei = loc.get(d.id);
        const s = new Map();
        s.set(d.id, 0);
        let maxw = 0;
        for (let i = head[ei]; i >= 0; i = next[i]) {
            if (nodes[to[i]].id === d.id)
                continue;
            s.set(nodes[to[i]].id, weight[i]);
            maxw = Math.max(maxw, weight[i]);
        }
        circles.attr("fill", (f) => {
            if (s.has(f.id))
                return "orange";
            else return "steelblue";
        });
        linkss.attr("stroke", (f) => {
            if (f.source == d.id || f.target == d.id)
                return "yellow";
            else return "#999";
        });
        text.attr("display", function (f) {
            if (s.has(f.id) && (f.id == d.id || s.get(f.id) > maxw / 2)) {
                return "null";
            }
            else {
                return "none";
            }
        })
    })
        .on("mouseout", (e, d) => {
            circles.data(data.nodes).attr("fill", "steelblue");
            linkss.data(data.links).attr("stroke", "#999");
            text.attr("display", function (f) {
                if (f.weight > 40) {
                    return 'null';
                }
                else {
                    return 'none';
                }
            })
        })

    // 保存图布局结果和花费时间为json格式，并按提交方式中重命名，提交时请注释这一部分代码
    // var content = JSON.stringify({ "time": end - begin, "nodes": nodes, "links": links });
    // var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    // saveAs(blob, "save.json");
}

function draw_graph() {
    let svg = d3.select('#container')
        .select('svg#graph')
        .attr('width', width)
        .attr('height', height);

    // 数据格式
    // nodes = [{"id": 学校名称, "weight": 毕业学生数量}, ...]
    // links = [{"source": 毕业学校, "target": 任职学校, "weight": 人数}, ...]
    let links = data.links;
    let nodes = data.nodes;

    let nodes_dict = {};
    for (let n of nodes) {
        nodes_dict[n.id] = n
    }

    // links
    let link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.weight));

    // nodes
    let node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => Math.sqrt(d.weight) * 2 + 0.5)
        .attr("fill", "steelblue")

    // 学校名称text，只显示满足条件的学校
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

    // 图布局算法
    graph_layout_algorithm(nodes, links)

    // 绘制links, nodes和text的位置
    link.attr("x1", d => nodes_dict[d.source].x)
        .attr("y1", d => nodes_dict[d.source].y)
        .attr("x2", d => nodes_dict[d.target].x)
        .attr("y2", d => nodes_dict[d.target].y);

    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);
    text.attr("x", d => d.x)
        .attr("y", d => d.y)
}

function main() {
    d3.json(data_file).then(function (DATA) {
        data = DATA;
        draw_graph();
    })
}

function onrun1() {
    for (name of ["C", "B", "R", "T"]) {
        vars[name] = document.getElementById(name).value;
    }
    console.log(vars);
    d3.selectAll("svg>*").remove();
    main()
}
window.onrun1 = onrun1;

main()