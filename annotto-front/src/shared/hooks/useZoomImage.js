import { useEffect } from 'react'

import useOnceCall from 'shared/hooks/useOnceCall'

const useZoomImage = (observedDiv, stage, status, imageWidth, imageHeight, moveLayerPos) => {
  useOnceCall(
    () => {
      const newScale = observedDiv.offsetWidth / imageWidth
      stage.scale({ x: newScale, y: newScale })
      stage.position({ x: -moveLayerPos.x * newScale, y: -moveLayerPos.y * newScale })
    },
    imageWidth && observedDiv && status === 'loaded',
    status === 'loading'
  )

  useOnceCall(
    () => {
      stage.height(imageHeight * (observedDiv.offsetWidth / imageWidth), status)
    },
    imageWidth && observedDiv && imageHeight && status === 'loaded',
    status === 'loading'
  )

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      stage.width(observedDiv.offsetWidth)
    })

    if (!observedDiv) {
      return
    }

    if (stage) {
      resizeObserver.observe(observedDiv)

      const scaleBy = 1.04

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
