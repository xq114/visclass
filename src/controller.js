import { TimeSpan } from "./timespan";
import { StackedArea } from "./stacked-area";
import { ScatterPlot } from "./scatter-plot";
import { ForceDirected } from "./force-directed";

function run(faculties, flow) {
  let ts = new TimeSpan("#p1", faculties);
  let fd = new ForceDirected("#p2");
  let sp = new ScatterPlot("#p3");
  let sa = new StackedArea("#p4");

  ts.draw_line();
  ts.draw_circles();
  sa.init(faculties);
  sp.init(faculties);
  fd.init(flow);
  fd.set_listener(
    (d) =>
      (document.getElementById("l3").innerHTML = `
    <h5>School Name</h5><p>${d.id}</p>
    `)
  );

  ts.set_listener(() => {
    let new_data = faculties.filter((d) => {
      let year = d["Ph.D. Graduation Year"];
      return year >= ts.start && year <= ts.end;
    });
    sa.update(new_data, ts.start, ts.end);
    sp.update(new_data);
  });
  sp.set_listener(
    (d) =>
      (document.getElementById("l3").innerHTML = `
    <h5>Name</h5><p>${d["First Name"]} ${d["Last Name"]}</p>
    <h5>Institution</h5><p>${d["Institution"]}</p>
    <h5>Research Interest</h5><p>${d["Research Interest"]}</p>
    <h5>Publications</h5><p>${d["Publications"]}</p>
    <h5>H-index</h5><p>${d["H-index"]}</p>
    <h5>Citations</h5><p>${d["Citations"]}</p>
    <h5>Ph.D. Graduate School</h5><p>${d["Ph.D. Graduate School"]}</p>
  `)
  );
}

export { run };
