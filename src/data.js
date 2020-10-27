let data = null;
let data_file = 'data/data.csv';

function get_min_max(data, attr) {
    let min = 1e9;
    let max = 0;
    data.forEach(d => {
        let v = parseInt(d[attr]);
        if (v > max)
            max = v;
        if (v < min)
            min = v;
    });
    console.log('attr', attr, 'min', min, 'max', max);

    return [min, max];
}

function get_mid(data, attr) {
    let sorted_data = data.sort((a, b) => parseInt(a[attr]) - parseInt(b[attr]));
    let length = data.length >> 1;
    let mid = parseInt(sorted_data[length][attr]);
    console.log("attr", attr, "mid", mid);

    return mid;
}

export { data_file, get_min_max, get_mid };