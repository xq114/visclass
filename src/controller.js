import { TimeSpan } from "./timespan";
import { StackedArea } from "./stacked-area";
import { ScatterPlot } from "./scatter-plot";

function run(faculties, flow) {
  let ts = new TimeSpan("#p1", faculties);
  ts.draw_line();
  ts.draw_circles();
  ts.set_listener(() => {
    console.log("Update!");
  });
  let fd = new forceDirected("#p2");
  fd.init(flow);
  let sa = new StackedArea("#p4");
  sa.init(faculties);
  let sp = new ScatterPlot("#p3");
  sp.set_listener(d => document.getElementById("l3").innerHTML = `
    <h5>Name</h5><p>${d["First Name"]} ${d["Last Name"]}</p>
    <h5>Institution</h5><p>${d["Institution"]}</p>
    <h5>Research Interest</h5><p>${d["Research Interest"]}</p>
    <h5>Publications</h5><p>${d["Publications"]}</p>
    <h5>H-index</h5><p>${d["H-index"]}</p>
    <h5>Citations</h5><p>${d["Citations"]}</p>
    <h5>Ph.D. Graduate School</h5><p>${d["Ph.D. Graduate School"]}</p>
  `);
  sp.init(faculties);
}

export { run };
