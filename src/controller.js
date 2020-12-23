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
  let sa = new StackedArea("#p4");
  sa.init(faculties);
  let sp = new ScatterPlot("#p3");
  sp.init(faculties);
}

export { run };
