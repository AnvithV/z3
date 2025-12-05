import { init } from 'z3-solver';

const { Context } = await init();
const { Solver, Int, And } = new Context('main');

const solver = new Solver();

const x = Int.const('x'); // x is a Z3 integer
solver.add(And(x.le(10), x.ge(9))); // x <= 10, x >= 9

if ((await solver.check()) === 'sat') {
  const model = solver.model();
  const xVal = parseInt(model.eval(x).toString(), 10);
  console.log(`sat. A valid value for x is: ${xVal}`);
} else {
  console.log('unsat. Could not find a valid value for x.');
}

