import { TimeSpan } from "./timespan";
import { StackedArea } from "./stacked-area"

function run(faculties, flow) {
  let ts = new TimeSpan("#p1", faculties);
  ts.draw_line();
  ts.draw_circles();
  ts.set_listener(() => {
    console.log("Update!");
  });
  let sa = new StackedArea("#p4");
  sa.init(faculties);
}

export { run };
