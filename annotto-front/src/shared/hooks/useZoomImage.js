import { useEffect } from 'react'

const useZoomImage = (observedDiv, stage, status, imageWidth, imageHeight) => {
  useEffect(() => {
    if (stage && status === 'loaded' && observedDiv.offsetWidth / imageWidth) {
      const oldScale = stage.scaleX()
      if (oldScale !== observedDiv.offsetWidth / imageWidth) {
        stage.scale({ x: observedDiv.offsetWidth / imageWidth, y: observedDiv.offsetWidth / imageWidth })
      }
    }
  }, [stage, status, imageWidth, observedDiv])

  useEffect(() => {
    if (imageHeight) {
      stage.height(imageHeight * (observedDiv.offsetWidth / imageWidth))
    }
  }, [stage, imageHeight, observedDiv, imageWidth])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      stage.width(observedDiv.offsetWidth)
    })

    if (!observedDiv) {
      return
    }

    if (stage) {
      resizeObserver.observe(observedDiv)

      const scaleBy = 1.03

      stage.on('wheel', (e) => {
        e.evt.preventDefault()

        const oldScale = stage.scaleX()
        const pointer = stage.getPointerPosition()

        const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale }

        let direction = e.evt.deltaY > 0 ? 1 : -1

        if (e.evt.ctrlKey) {
          direction = -direction
        }

        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

        if (newScale < 0.5 || newScale > 2) {
          return
        }

        stage.scale({ x: newScale, y: newScale })

        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        }
        stage.position(newPos)
      })
    }
  }, [observedDiv, stage])
}

export default useZoomImage
