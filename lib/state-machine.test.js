import test from 'ava'
import { createStateMachine, createTransition } from "./state-machine"

test("createTransition should return transition object", t => {
  const transition = createTransition("start", "finish")

  t.is(transition.from, "start")
  t.is(transition.to, "finish")
})

test("should have transition methods available", t => {
  const tsm = createStateMachine({
    initial: 'init',
    transitions: {
      first:    createTransition('init'  , 'first'),
      second:   createTransition('first' , 'second'),
      third:    createTransition('second', 'third')
    }
  })

  t.true(typeof tsm.first === "function")
  t.true(typeof tsm.second === "function")
  t.true(typeof tsm.third === "function")
})

test("should have .state property available and representing current state", t => {
  const result = [false, false, false]
  const tsm = createStateMachine({
    initial: 'init',
    transitions: {
      first:    createTransition('init'  , 'first'),
      second:   createTransition('first' , 'second'),
      third:    createTransition('second', 'third')
    },
    methods: {
      onFirst: () => result[0] = true,
      onSecond: () => result[1] = true,
      onThird: () => result[2] = true
    }
  })

  tsm.first()
  t.is(tsm.state, 'first')

  tsm.second()
  t.is(tsm.state, 'second')

  tsm.third()
  t.is(tsm.state, 'third')
})

test("should have all handler methods called", t => {
  const result = [false, false, false]
  const tsm = createStateMachine({
    initial: 'init',
    transitions: {
      first:    createTransition('init'  , 'first'),
      second:   createTransition('first' , 'second'),
      third:    createTransition('second', 'third')
    },
    methods: {
      onFirst: () => result[0] = true,
      onSecond: () => result[1] = true,
      onThird: () => result[2] = true
    }
  })

  tsm.first()
  tsm.second()
  tsm.third()

  t.deepEqual(result, [true, true, true])
})


test("can update state within handler method", t => {
  let executedCalled = false
  let loaded = false

  const tsm = createStateMachine({
    initial: "unready",
    transitions: {
      ready: createTransition('unready', 'unloaded'),
      loadAndExecute: createTransition('unloaded', 'loaded'),
      execute: createTransition('loaded', 'executed')
    },
    methods: {
      onLoadAndExecute: () => {
        tsm.execute()
      },
      onExecute: () => executedCalled = true
    }
  })

  t.is(tsm.state, 'unready')

  tsm.ready()
  t.is(tsm.state, 'unloaded')

  tsm.loadAndExecute()
  t.is(tsm.state, 'executed')
  t.true(executedCalled)

})


test("can have multiple transitions from one state", t => {
  const water = createStateMachine({
    initial: 'liquid',
    transitions: {
      melt:   createTransition('solid', 'liquid'),
      freeze: createTransition('liquid', 'solid'),

      vaporize: createTransition('liquid', 'gas'),
      condense: createTransition('gas', 'liquid')
    }
  })

  water.freeze()
  t.is(water.state, 'solid')

  water.melt()
  t.is(water.state, 'liquid')

  water.vaporize()
  t.is(water.state, 'gas')

  water.condense()
  t.is(water.state, 'liquid')
})

test("can have multiple 'from' values as array", t => {
  const cd = createStateMachine({
    initial: 'on_sale',
    transitions: {
      buy: createTransition('on_sale', 'bought'),
      play: createTransition(['bought', 'stopped'], 'playing'),
      stop: createTransition('playing', 'stopped')
    }
  })

  cd.buy()
  t.is(cd.state, 'bought')

  cd.play()
  t.is(cd.state, 'playing')

  cd.stop()
  t.is(cd.state, 'stopped')

  cd.play()
  t.is(cd.state, 'playing')
})
