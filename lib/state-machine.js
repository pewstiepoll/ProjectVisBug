/**
 * @typedef StateMachineParams          Config object for state machine creator function
 * @property {String} initial           Initial value for state machine
 * @property {Object} transitions       Object of available transitions
 * @property {Object} methods
 *
 *
 * @param {StateMachineParams} config   State machine configuration object
 * @returns {Object}                    New finite state machine
 * @example
 * const extensionStateMachine = stateMachine({
 *  initial: 'unloaded',
 *  transitions: {
 *    load:   createTransition('unloaded', 'loaded'),
 *    inject: createTransition('loaded'  , 'injected'),
 *    eject:  createTransition('injected', 'loaded'),
 *  },
 *  methods: {
 *    onLoad:   () => console.log('loading'),
 *    onInject: () => console.log('injecting'),
 *    onEject:  () => console.log("ejecting")
 *  }
 * })
 */

export function createStateMachine ({ initial, transitions, methods }) {
  const proxyObject = {
    state: initial,
    can: (transition) => transition.from === proxyObject.state || (Array.isArray(transition.from) && transition.from.includes(proxyObject.state))
  }

  return new Proxy(proxyObject, {
    get: (self, prop) => {
      if (prop in transitions) {
        const transition = transitions[prop]


        return (...params) => {
          if (!self.can(transition))
            throw new ReferenceError(`Cannot call '${prop}' on '${self.state}'`)

            const handlerName = 'on' + prop.charAt(0).toUpperCase() + prop.slice(1)

            self.state = transition.to

            if (methods && typeof methods[handlerName] === "function")
              methods[handlerName](self, ...params)
        }
      } else {
        return self[prop]
      }
    }
  })
}

/**
 * @function createTransition
 * @param {String|Array} from
 * @param {String} to
 * @returns {Object} transition object
 */
export const createTransition = (from, to) => ({from, to})
