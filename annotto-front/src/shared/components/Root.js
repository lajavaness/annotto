import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { configure } from 'react-hotkeys'
import { createStore } from 'redux-dynamic-modules'
import { getSagaExtension } from 'redux-dynamic-modules-saga'
import React from 'react'

import rootModule from 'modules/root'

import sagas from 'shared/sagas'

import theme from '__theme__'

import App from 'shared/components/app/App'

import 'antd/dist/antd.less'
import 'assets/locales'

const sagaExtension = getSagaExtension()

const store = createStore({
  extensions: [sagaExtension],
})

sagaExtension.middleware[0].run(sagas)

store.addModule(rootModule)

configure({
  ignoreEventsCondition: (event) => {
    const { target } = event

    if (target && target.tagName) {
      const tagName = target.tagName.toLowerCase()
      const type = target.getAttribute('type')
      if (
        ['select', 'textarea'].includes(tagName) ||
        (tagName === 'input' && type && !['checkbox', 'radio'].includes(type))
      ) {
        return true
      }
    }

    return false
  },
})

const Root = () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>
)

export default Root
