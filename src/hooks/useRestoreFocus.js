import { useEffect } from 'react'
import finder from '@medv/finder'
import { cache, getCached } from '../utils'

function useListener(name, fn) {
  useEffect(() => {
    document.addEventListener(name, fn)

    return () => {
      document.removeEventListener(name, fn)
    }
  }, [])
}

export default function useRestoreFocus() {
  // const [selector, setSelector] = useLocalStorage('__useRestoreFocus')
  const cacheKey = '__useRestoreFocus'
  const [selector, setSelector] = [getCached(cacheKey), cache(cacheKey)]

  function onFocus(ev) {
    const selector = finder(ev.target)
    setSelector(selector)
  }

  useEffect(() => {
    const el = document.querySelector(selector)
    if (el) {
      el.focus()
    }
  }, [])

  useListener('focusin', onFocus)
}
