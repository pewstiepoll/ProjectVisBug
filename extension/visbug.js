import { createTransition, createStateMachine } from "../lib/state-machine"

// extension states (per tab)
// 1. unloaded
// 2. loaded
// 3. injected
// 4. ejected

// extension state actions (per tab)
// 1. load  :   unloaded        -> loaded
// 2. inject:   loaded|ejected  -> injected
// 3. eject :   injected        -> ready

const extensionStateMachineConfig = {
  initial: 'unloaded',
  transitions: {
    load:   createTransition('unloaded', 'loaded'),
    inject: createTransition(['loaded', 'ejected'], 'injected'),
    eject:  createTransition('injected', 'ejected'),
    unload: createTransition(['loaded', 'ejected', 'injected'], 'unloaded')
  },
  methods: {
    onLoad: () => {
      chrome.tabs.insertCSS(tab_id,     { file: 'build/bundle.css' })
      chrome.tabs.executeScript(tab_id, { file: 'web-components.polyfill.js' })
      chrome.tabs.executeScript(tab_id, { file: 'build/bundle.js' })
    },
    onInject: () => {
      chrome.tabs.executeScript(tab_id, { file: 'toolbar/inject.js' })

      getColorMode()
    },
    onEject: () => {
      chrome.tabs.executeScript(tab_id, { file: 'toolbar/eject.js' })
    }
  }
};

const tabs = {}

export const toggleIn = ({id:tab_id}) => {
  // if current tab doesn't have extension state yet - create it
  if (!tabs[tab_id])
    tabs[tab_id] = createStateMachine(extensionStateMachineConfig)

  const extension = tabs[tab_id]

  switch (extension.state) {
    case 'loaded':
        // initial call - load and inject the extension
        extension.load()
        extension.inject()
        break
    case 'injected':
        // eject the extension
        extension.eject()
        break
    case 'loaded':
    case 'ejected':
        // extension is already loaded - inject it
        extension.inject()
        break
  }
}

chrome.tabs.onUpdated.addListener(function(tab_id) {
  // tab was updated - unload its state
  if (tabs[tab_id]) tabs[tab_id].unload()
})
