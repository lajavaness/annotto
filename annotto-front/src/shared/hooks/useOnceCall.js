import { useEffect, useRef } from 'react'

const useOnceCall = (cb, condition, changeCondition) => {
  const isCalledRef = useRef(false)

  useEffect(() => {
    if (changeCondition) {
      isCalledRef.current = false
    }
  }, [changeCondition])

  useEffect(() => {
    if (condition && !isCalledRef.current) {
      isCalledRef.current = true
      cb()
    }
  }, [cb, condition])
}

export default useOnceCall
