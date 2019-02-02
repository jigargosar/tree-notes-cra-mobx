import React from 'react'
import * as ReactDOM from 'react-dom'
import 'tachyons'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import Posts from './Posts'

function render() {
  ReactDOM.render(<App />, document.getElementById('root'))
  ReactDOM.render(<Posts />, document.getElementById('overmindPostsApp'))
}

render()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()

// if (module.hot) module.hot.accept('./App', () => render())
