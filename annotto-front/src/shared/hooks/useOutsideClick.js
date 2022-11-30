import { useEffect } from 'react'

const isValidEvent = (event, { current }) => {
  if (event.button > 0) {
    return false
  }

  if (event.target) {
    const { ownerDocument } = event.target
    if (!ownerDocument || !ownerDocument.body.contains(event.target)) {
      return false
    }
  }

  return current && !current.contains(event.target)
}

const useOutsideClick = (ref, callback) => {
  const handleClick = (e) => {
    if (isValidEvent(e, ref) && !!callback) {
      callback()
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  })
}

export default useOutsideClick
