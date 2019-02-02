import React from 'react'
import * as ReactDOM from 'react-dom'
import 'tachyons'
import './index.css'
import * as serviceWorker from './serviceWorker'
import App from './App'

function render() {
  ReactDOM.render(<App />, document.getElementById('root'))
}

render()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()

// if (module.hot) module.hot.accept('./App', () => render())
