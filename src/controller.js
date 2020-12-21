import { TimeSpan } from './timespan';

function run(faculties, flow) {
  console.log(flow);
  let ts = new TimeSpan("#p1", faculties);
  ts.draw_line();
  ts.draw_circles();
  ts.set_listener(() => {
    console.log("Update!");
  });
}

export { run };
