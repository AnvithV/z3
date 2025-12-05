import './style.css'
import Phaser from 'phaser'
import { init } from 'z3-solver'

const app = document.querySelector('#app')
const pets = ['cat', 'dog', 'turtle', 'hamster']
const intVal = (model, sym) => parseInt(model.eval(sym).toString(), 10)

function renderShell(status = 'loading...') {
  app.innerHTML = `
    <div class="page">
      <header>
        <h1>Z3 + Phaser (Vite)</h1>
        <p>Browser demo of Z3 constraints plus a Phaser scene placeholder.</p>
        <p id="isolation-status" class="note">Isolation: checking...</p>
      </header>
      <section>
        <h2>Children & Pets</h2>
        <pre id="pets-output">${status}</pre>
      </section>
      <section>
        <h2>Fence Constraints</h2>
        <pre id="fence-output">${status}</pre>
      </section>
      <section>
        <h2>Value Sampling</h2>
        <pre id="sample-output">${status}</pre>
      </section>
      <section>
        <h2>Phaser Scene</h2>
        <div id="phaser-root" class="phaser-host"></div>
      </section>
    </div>
  `
}

const Z3_SCRIPT_URL = '/z3/z3-built.js'

function loadZ3Script() {
  if (globalThis.initZ3) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script')
    tag.src = Z3_SCRIPT_URL
    tag.onload = () => (globalThis.initZ3 ? resolve() : reject(new Error('initZ3 still undefined after script load')))
    tag.onerror = () => reject(new Error(`Failed to load ${Z3_SCRIPT_URL}`))
    document.head.appendChild(tag)
  })
}

async function makeContext() {
  await loadZ3Script()
  const { Context } = await init()
  return new Context('browser')
}

async function solveChildrenPets(z3) {
  const { Solver, Int, And, Or, Distinct } = z3
  const solver = new z3.Solver()
  const alice = Int.const('alice')
  const ben = Int.const('ben')
  const chloe = Int.const('chloe')
  const diego = Int.const('diego')
  const vars = [alice, ben, chloe, diego]

  solver.add(...vars.map((v) => And(v.ge(0), v.le(3))))
  solver.add(Or(alice.eq(0), alice.eq(3)))
  solver.add(Or(ben.eq(1), ben.eq(2)))
  solver.add(And(chloe.neq(0), chloe.neq(1)))
  solver.add(diego.gt(ben))
  solver.add(Distinct(...vars))

  if ((await solver.check()) !== 'sat') return 'unsat'
  const m = solver.model()
  return {
    alice: pets[intVal(m, alice)],
    ben: pets[intVal(m, ben)],
    chloe: pets[intVal(m, chloe)],
    diego: pets[intVal(m, diego)],
  }
}

async function generateFencePoints(z3) {
  const { Solver, Int, And, Or, Not } = z3
  const inside = new Solver()
  const onFence = new Solver()
  const outside = new Solver()

  const x1 = Int.const('x1')
  const y1 = Int.const('y1')
  inside.add(And(x1.ge(5), x1.le(10)))
  inside.add(And(y1.ge(15), y1.le(25)))

  const x2 = Int.const('x2')
  const y2 = Int.const('y2')
  const onLeft = And(x2.eq(5), y2.ge(15), y2.le(25))
  const onTop = And(y2.eq(15), x2.ge(5), x2.le(10))
  onFence.add(Or(onLeft, onTop))

  const x3 = Int.const('x3')
  const y3 = Int.const('y3')
  outside.add(And(x3.ge(8), y3.ge(20)))
  outside.add(Or(x3.gt(10), y3.gt(25), x3.lt(5), y3.lt(15)))
  outside.add(Not(And(x3.ge(5), x3.le(10), y3.ge(15), y3.le(25))))

  await inside.check()
  await onFence.check()
  await outside.check()

  const mInside = inside.model()
  const mOn = onFence.model()
  const mOut = outside.model()

  return {
    inside: { x: intVal(mInside, x1), y: intVal(mInside, y1) },
    onFence: { x: intVal(mOn, x2), y: intVal(mOn, y2) },
    outside: { x: intVal(mOut, x3), y: intVal(mOut, y3) },
  }
}

async function sampleAllValidIntegers(z3) {
  const { Solver, Int, And } = z3
  const solver = new Solver()
  const v = Int.const('v')
  solver.add(And(v.ge(1), v.le(10)))
  solver.add(And(v.neq(3), v.neq(8)))

  const valid = []
  while ((await solver.check()) === 'sat') {
    const m = solver.model()
    const value = intVal(m, v)
    valid.push(value)
    solver.add(v.neq(value))
  }
  const pick = valid[Math.floor(Math.random() * valid.length)]
  return { valid, pick }
}

function mountPhaser() {
  const scene = {
    preload() {},
    create() {
      this.add.rectangle(200, 150, 300, 200, 0x1d3557).setStrokeStyle(4, 0xf1fa8c)
      this.add.text(120, 140, 'Phaser ready + Z3 demo', { color: '#f8f8f2' })
    },
  }

  new Phaser.Game({
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    parent: 'phaser-root',
    backgroundColor: '#0b132b',
    scene,
  })
}

async function main() {
  renderShell()
  try {
    const iso = `crossOriginIsolated=${globalThis.crossOriginIsolated}, SharedArrayBuffer=${typeof SharedArrayBuffer}`
    const isoEl = document.querySelector('#isolation-status')
    if (isoEl) isoEl.textContent = iso

    const z3 = await makeContext()
    const petsSolution = await solveChildrenPets(z3)
    document.querySelector('#pets-output').textContent = JSON.stringify(petsSolution, null, 2)

    const fenceSolutions = await generateFencePoints(z3)
    document.querySelector('#fence-output').textContent = JSON.stringify(fenceSolutions, null, 2)

    const samples = await sampleAllValidIntegers(z3)
    document.querySelector('#sample-output').textContent = JSON.stringify(samples, null, 2)
  } catch (err) {
    const message = `Z3 init/solve failed: ${err?.message ?? err}`
    document.querySelectorAll('pre').forEach((el) => {
      el.textContent = message
    })
    console.error(err)
  }

  mountPhaser()
}

main()
