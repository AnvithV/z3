import { init } from 'z3-solver';

const { Context } = await init();
const { Solver, Int, And, Or, Distinct, Not } = new Context('main');

const pets = ['cat', 'dog', 'turtle', 'hamster'];

// Utility to extract a model value as an int.
const intVal = (model, sym) => parseInt(model.eval(sym).toString(), 10);

// Solve the children-and-pets puzzle with one integer variable per child.
async function solveChildrenPets() {
  const solver = new Solver();

  const alice = Int.const('alice');
  const ben = Int.const('ben');
  const chloe = Int.const('chloe');
  const diego = Int.const('diego');

  const allVars = [alice, ben, chloe, diego];
  // Domain: each child owns exactly one pet encoded 0..3
  solver.add(...allVars.map((v) => And(v.ge(0), v.le(3))));

  // Constraints (crafted to yield a unique assignment):
  // - Alice has either the cat or hamster.
  solver.add(Or(alice.eq(0), alice.eq(3)));
  // - Ben has either the dog or turtle.
  solver.add(Or(ben.eq(1), ben.eq(2)));
  // - Chloe does not have the cat or dog.
  solver.add(And(chloe.neq(0), chloe.neq(1)));
  // - Diego's pet index is greater than Ben's.
  solver.add(diego.gt(ben));
  // - Each child has a different pet.
  solver.add(Distinct(...allVars));

  if ((await solver.check()) !== 'sat') {
    console.log('Children & pets: unsat');
    return;
  }

  const model = solver.model();
  const solution = {
    alice: pets[intVal(model, alice)],
    ben: pets[intVal(model, ben)],
    chloe: pets[intVal(model, chloe)],
    diego: pets[intVal(model, diego)],
  };

  console.log('Children & pets solution:', solution);
}

// Generate a point strictly inside the fence.
async function generateInsideFence() {
  const solver = new Solver();
  const x = Int.const('x');
  const y = Int.const('y');

  solver.add(And(x.ge(5), x.le(10)));
  solver.add(And(y.ge(15), y.le(25)));

  if ((await solver.check()) !== 'sat') {
    console.log('Inside fence: unsat');
    return;
  }
  const model = solver.model();
  console.log('Inside fence point:', { x: intVal(model, x), y: intVal(model, y) });
}

// Generate a point on the top or left fence side (but not inside).
async function generateOnFence() {
  const solver = new Solver();
  const x = Int.const('x');
  const y = Int.const('y');

  const onLeft = And(x.eq(5), y.ge(15), y.le(25));
  const onTop = And(y.eq(15), x.ge(5), x.le(10));
  solver.add(Or(onLeft, onTop));

  if ((await solver.check()) !== 'sat') {
    console.log('On fence: unsat');
    return;
  }
  const model = solver.model();
  console.log('On fence point:', { x: intVal(model, x), y: intVal(model, y) });
}

// Generate a point outside the fence with x >= 8 and y >= 20, not on the fence.
async function generateOutsideFence() {
  const solver = new Solver();
  const x = Int.const('x');
  const y = Int.const('y');

  solver.add(And(x.ge(8), y.ge(20)));
  // Outside the rectangle (not on its boundary).
  solver.add(Or(x.gt(10), y.gt(25), x.lt(5), y.lt(15)));
  solver.add(Not(And(x.ge(5), x.le(10), y.ge(15), y.le(25)))); // exclude inside/boundary explicitly

  if ((await solver.check()) !== 'sat') {
    console.log('Outside fence: unsat');
    return;
  }
  const model = solver.model();
  console.log('Outside fence point:', { x: intVal(model, x), y: intVal(model, y) });
}

// Enumerate and sample all valid integers in a finite range using "block the model" loops.
async function sampleAllValidIntegers() {
  const solver = new Solver();
  const v = Int.const('v');

  // Example constraint set: 1 <= v <= 10 and v != 3 and v != 8
  solver.add(And(v.ge(1), v.le(10)));
  solver.add(And(v.neq(3), v.neq(8)));

  const valid = [];
  while ((await solver.check()) === 'sat') {
    const model = solver.model();
    const value = intVal(model, v);
    valid.push(value);
    solver.add(v.neq(value)); // block this value and search for another
  }

  const randomPick = valid[Math.floor(Math.random() * valid.length)];
  console.log('All valid integers:', valid);
  console.log('Randomly picked value:', randomPick);
}

// Wheelbarrow inside fence.
async function placeWheelbarrow() {
  const solver = new Solver();
  const x = Int.const('wheel_x');
  const y = Int.const('wheel_y');
  solver.add(And(x.ge(5), x.le(10), y.ge(15), y.le(25)));

  if ((await solver.check()) !== 'sat') {
    console.log('Wheelbarrow: unsat');
    return;
  }
  const m = solver.model();
  console.log('Wheelbarrow position:', { x: intVal(m, x), y: intVal(m, y) });
}

// Mushroom inside forest, avoiding existing trees/mushrooms.
async function placeMushroom() {
  // Example forest tiles and occupied tiles.
  const forestTiles = [
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 4, y: 3 },
  ];
  const occupied = [
    { x: 2, y: 2 }, // existing tree
    { x: 3, y: 3 }, // existing mushroom
  ];

  const solver = new Solver();
  const idx = Int.const('mush_idx');
  solver.add(And(idx.ge(0), idx.lt(forestTiles.length)));

  // Block occupied tiles
  occupied.forEach((t) => {
    const match = And(idx.eq(forestTiles.findIndex((ft) => ft.x === t.x && ft.y === t.y)));
    solver.add(Or(match.not()));
  });

  if ((await solver.check()) !== 'sat') {
    console.log('Mushroom: unsat');
    return;
  }
  const m = solver.model();
  const pick = forestTiles[intVal(m, idx)];
  console.log('Mushroom position:', pick);
}

// Signs: place 3 distinct signs adjacent to a path.
async function placeSigns() {
  const pathAdj = [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 0, y: 2 },
    { x: 2, y: 2 },
  ];
  const solver = new Solver();
  const i1 = Int.const('sign1');
  const i2 = Int.const('sign2');
  const i3 = Int.const('sign3');

  const dom = (v) => And(v.ge(0), v.lt(pathAdj.length));
  solver.add(dom(i1), dom(i2), dom(i3));
  solver.add(Distinct(i1, i2, i3)); // using 3 signs (within required 2-3)

  if ((await solver.check()) !== 'sat') {
    console.log('Signs: unsat');
    return;
  }
  const m = solver.model();
  const picks = [intVal(m, i1), intVal(m, i2), intVal(m, i3)].map((idx) => pathAdj[idx]);
  console.log('Sign positions (3 distinct):', picks);
}

// Beehive: place anywhere empty (not occupied).
async function placeBeehive() {
  const allTiles = [
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 7, y: 5 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
    { x: 7, y: 6 },
  ];
  const occupied = [
    { x: 5, y: 5 },
    { x: 6, y: 5 },
  ];

  const solver = new Solver();
  const idx = Int.const('hive_idx');
  solver.add(And(idx.ge(0), idx.lt(allTiles.length)));

  // Block occupied tiles
  occupied.forEach((t) => {
    const matchIndex = allTiles.findIndex((ft) => ft.x === t.x && ft.y === t.y);
    if (matchIndex >= 0) solver.add(idx.neq(matchIndex));
  });

  if ((await solver.check()) !== 'sat') {
    console.log('Beehive: unsat');
    return;
  }
  const m = solver.model();
  console.log('Beehive position:', allTiles[intVal(m, idx)]);
}

await solveChildrenPets();
await generateInsideFence();
await generateOnFence();
await generateOutsideFence();
await sampleAllValidIntegers();
await placeWheelbarrow();
await placeMushroom();
await placeSigns();
await placeBeehive();

