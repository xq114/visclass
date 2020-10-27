import * as d3 from 'd3';
import * as jQuery from 'jquery';
const $ = jQuery.default;

import { data_file, get_min_max, get_mid } from './data.js';
let data = null;

function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

let _width = $(window).width() - convertRemToPixels(10);
let _height = $(window).height();
let width = 1.0 * _width;
let height = 0.96 * _height;

// let x_attr = 'Institution Index';
let x_attr = 'Ph.D. Graduation Year';
let y_attr = 'H-index';
let r_attr = 'Citations';
// let highlight_attr = 'Research Interest';
let highlight_attr = 'Institution Index';
let tsinghua = 296;

let fontFamily;

function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Khand-Regular";
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily);
}

function draw_main() {
    let padding = { 'left': 0.2 * width, 'bottom': 0.1 * height, 'top': 0.2 * height, 'right': 0.1 * width };
    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    // title
    svg.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${padding.top * 0.4})`)
        .append('text')
        .attr('class', 'title')
        .text('A Visualization for Faculties That Research on Computer Science in Well-known Universities');

    console.log(data);
    // x axis - phd graduation year
    let x = d3.scaleLinear()
        .domain(get_min_max(data, x_attr))
        .range([padding.left, width - padding.right]);
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d => d);

    // y axis - publications
    let y = d3.scaleLinear()
        .domain(get_min_max(data, y_attr))
        .range([height - padding.bottom, padding.top]);
    let axis_y = d3.axisLeft()
        .scale(y)
        .ticks(10)
        .tickFormat(d => d);

    // [mid, max] => [2, 6]
    // (max/min)^alpha = 100
    let r_min_max = get_min_max(data, r_attr);
    let r_mid = get_mid(data, r_attr);
    let exponent = Math.log(3) / (Math.log(r_min_max[1]) - Math.log(r_mid));
    console.log(exponent);

    // x axis
    svg.append('g')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem')

    svg.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${height - padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08 * height)
        .text(x_attr);

    // y axis
    svg.append('g')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem')
    svg.append('g')
        .attr('transform', `
            translate(${padding.left}, ${height / 2})
            rotate(-90)    
        `)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height * 0.07)
        .text(y_attr);

    // points
    svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        // .sort((a, b) => a[highlight_attr] === b[highlight_attr] ? 0 : a[highlight_attr] === tsinghua ? 1 : -1)
        .attr('class', 'point')
        .attr('cx', (d, i) => {
            //console.log('data', d); 
            return x(parseInt(d[x_attr]));
        })
        .attr('cy', (d, i) => y(parseInt(d[y_attr])))
        .attr('r', (d, i) => Math.pow(parseInt(d[r_attr]) / r_min_max[1], exponent) * 6)
        .attr('style', 'fill:#FCCF31;opacity:0.6;')
        .on('mouseover', (e, d) => {

            //console.log('e', e, 'd', d)

            // show a tooltip
            let name = d['First Name'] + ' ' + d['Mid Name'] + ' ' + d['Last Name'];
            let institution = d['Institution'];
            let grad_year = d['Ph.D. Graduation Year'];
            let grad_school = d['Ph.D. Graduate School'];
            let pubs = d['Publications'];
            let cites = d['Citations'];
            //console.log('data', d);


            let content = '<table><tr><td class="idx">Name</td><td>' + name + '</td></tr>'
                + '<tr><td class="idx">Institution</td><td>' + institution + '</td></tr>'
                + '<tr><td class="idx">Ph.D. Grad Year</td><td>' + grad_year + '</td></tr>'
                + '<tr><td class="idx">Ph.D. Grad School</td><td>' + grad_school + '</td></tr>'
                + '<tr><td class="idx">Publications</td><td>' + pubs + '</td></tr>'
                + '<tr><td class="idx">Citations</td><td>' + cites + '</td></tr></table>';

            // tooltip
            let tooltip = d3.select('#tooltip');
            tooltip = tooltip.html(content);
            let tooltiph = tooltip.property("offsetHeight");
            let topdist = (y(parseInt(d[y_attr])) + 5);
            if (y(parseInt(d[y_attr])) > 0.5 * height)
                topdist = (y(parseInt(d[y_attr])) - tooltiph - 5);
            tooltip.style('left', (x(parseInt(d[x_attr])) + 5 - width / 12) + 'px')
                .style('top', topdist + 'px')
                // .transition().duration(500)
                .style('visibility', 'visible');

            // color pick
            let highlight = d[highlight_attr];
            let circles = d3.selectAll('circle');
            circles//.data(data)
                .attr('style', (d, i) => d[highlight_attr] === highlight ? 'fill:#0396FF;opacity:1.0;' : 'fill:#FCCF31;opacity:0.2;')
            // .sort((a, b) => a[highlight_attr] === b[highlight_attr] ? 0 : a[highlight_attr] === highlight ? 1 : -1);
        })
        .on('mouseout', (e, d) => {
            // remove tooltip
            let tooltip = d3.select('#tooltip');
            tooltip.style('visibility', 'hidden');
            let circles = d3.selectAll('circle');
            circles.attr('style', 'fill:#FCCF31;opacity:0.6;');
        });
}

let inst_list = [];

function main() {
    d3.csv(data_file).then(function (DATA) {
        data = DATA;

        if (inst_list.length == 0) {
            let current_inst = null;
            data.forEach(function (d) {
                if (d['Institution'] != current_inst) {
                    current_inst = d['Institution'];
                    inst_list.push(current_inst);
                }
            });
        }

        // remove data without x_attr or y_attr
        data = data.filter((d, i) => (d[x_attr] != '' && d[y_attr] != ''))
            .sort((a, b) => a['Institution Index'] === b['Institution Index'] ? 0 : a['Institution Index'] === tsinghua ? 1 : -1);
        set_ui();
        draw_main();
    });
}

function onclick1() {
    y_attr = 'H-index';
    r_attr = 'Citations';
    d3.selectAll("g").remove();
    main();
}
window.onclick1 = onclick1;

function onclick2() {
    y_attr = 'Citations';
    r_attr = 'H-index';
    d3.selectAll("g").remove();
    main();
}
window.onclick2 = onclick2;

let uniq = null;

$(filter).on("keydown", function (e) {
    let keycode = e.keycode || e.which;
    if (keycode == 13) {
        let inst = uniq;
        if (uniq != null) {
            let circles = d3.selectAll('circle')
                .attr('style', (d, i) => d['Institution'] === inst ? 'fill:#0396FF;opacity:1.0;' : 'fill:#FCCF31;opacity:0.2;');
        }
    } else {
        d3.selectAll('circle').attr('style', 'fill:#FCCF31;opacity:0.6;');
    }
});

$(filter).on("input", function (e) {
    let cur_input = $(filter).val();
    let triggerd = inst_list.filter((d, i) => d.startsWith(cur_input));
    console.log(cur_input);
    d3.selectAll("#input_con>div").remove();
    if (triggerd.length == 1) {
        uniq = triggerd[0];
    } else {
        uniq = null;
    }
    for (let i = 0; i < triggerd.length && i < 5; i++) {
        d3.select("#input_con").append("div").text(triggerd[i]);
    }
});

main();