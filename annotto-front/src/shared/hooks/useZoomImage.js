import { useEffect } from 'react'

const useZoomImage = (observedDiv, stage) => {
  useEffect(() => {
    if (!observedDiv) {
      return
    }
    const resizeObserver = new ResizeObserver(() => {
      stage.width(observedDiv.offsetWidth)
      stage.height(observedDiv.offsetHeight)
    })

    resizeObserver.observe(observedDiv)

    if (stage) {
      const scaleBy = 1.05

      stage.on('wheel', (e) => {
        e.evt.preventDefault()

        const oldScale = stage.scaleX()
        const pointer = stage.getPointerPosition()

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        }

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
  }, [observedDiv])
}

export default useZoomImage
