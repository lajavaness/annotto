import { flatten, isNumber } from 'lodash'
import PropTypes from 'prop-types'
import { useRef, useState, useEffect } from 'react'
import { Group, Image, Line, Text, Transformer, Tag, Label } from 'react-konva'
import useImage from 'use-image'

const ZoneMarker = ({
  index,
  task,
  annotationIndex,
  predictionIndex,
  zone,
  imageWidth,
  imageHeight,
  isSelected,
  scale,
  onValidateClick,
  onDeleteClick,
  onSelectClick,
  onTransformEnd,
  onDragEnd,
}) => {
  const lineRef = useRef()
  const transformerRef = useRef()

  const [isHovered, setIsHovered] = useState(false)

  const [tagIcon] = useImage(`${process.env.PUBLIC_URL}/static/images/tag.svg`)
  const [patternIcon] = useImage(`${process.env.PUBLIC_URL}/static/images/pattern.svg`)
  const [closeIcon] = useImage(`${process.env.PUBLIC_URL}/static/images/close.svg`)
  const [validateIcon] = useImage(`${process.env.PUBLIC_URL}/static/images/validate.svg`)

  const isPrefill = isNumber(annotationIndex) && isNumber(predictionIndex)
  const isPrediction = isNumber(predictionIndex) && !isNumber(annotationIndex)

  const points = flatten(zone.map(({ x, y }) => [x * imageWidth, y * imageHeight]))

  const findTopRightPoint = () =>
    zone.reduce((acc, point) => (point.x + acc.y > acc.x + point.y ? point : acc), zone[0])

  const findTopLeftPoint = () => zone.reduce((acc, point) => (acc.x + acc.y > point.x + point.y ? point : acc), zone[0])

  const styleZoom = () => {
    switch (true) {
      case isHovered:
        return { fill: task?.color, opacity: 0.3 }
      case isPrediction:
        return { fillPatternImage: patternIcon, opacity: 0.5, dash: [4, 4] }
      case isPrefill:
        return { fill: 'transparent', opacity: 0.5, dash: [4, 4] }

      default:
        return { fill: 'transparent', opacity: 1 }
    }
  }

  useEffect(() => {
    if (isSelected && transformerRef.current && lineRef.current) {
      transformerRef.current.nodes([lineRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const _onMouseEnter = () => setIsHovered(true)

  const _onMouseLeave = () => setIsHovered(false)

  return (
    <Group draggable={!isPrediction} onMouseEnter={_onMouseEnter} onMouseLeave={_onMouseLeave} onDragEnd={onDragEnd}>
      <Group position="relative">
        {isPrediction && (
          <Image
            position="absolute"
            width={24 / scale}
            height={24 / scale}
            image={tagIcon}
            x={findTopLeftPoint().x * imageWidth}
            y={findTopLeftPoint().y * imageHeight}
          />
        )}
        {isHovered && (
          <Group
            position="absolute"
            x={
              isPrediction
                ? findTopLeftPoint().x * imageWidth + 30 / scale
                : findTopLeftPoint().x * imageWidth + 4 / scale
            }
            y={findTopLeftPoint().y * imageHeight + 4 / scale}
          >
            <Label>
              <Tag fill={task.color} cornerRadius={2} />
              <Text fontSize={16 / scale} text={task?.label} padding={2} />
            </Label>
          </Group>
        )}
        <Line
          closed
          name={`zoom_${index}`}
          ref={lineRef}
          stroke={task.color}
          points={points}
          {...styleZoom()}
          onClick={!isPrediction && onSelectClick}
          onTransformEnd={onTransformEnd}
        />
      </Group>
      {isHovered && (
        <Image
          name="actionIcon"
          position="absolute"
          width={12 / scale}
          height={12 / scale}
          image={isPrediction && !isPrefill ? validateIcon : closeIcon}
          x={findTopRightPoint().x * imageWidth - 16 / scale}
          y={findTopRightPoint().y * imageHeight + 4 / scale}
          onMouseEnter={(e) => {
            const container = e.target.getStage().container()
            container.style.cursor = 'pointer'
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage().container()
            container.style.cursor = 'default'
          }}
          onClick={isPrediction && !isPrefill ? onValidateClick : onDeleteClick}
        />
      )}
      {isSelected && <Transformer ref={transformerRef} flipEnabled={false} />}
    </Group>
  )
}

export default ZoneMarker

ZoneMarker.propTypes = {
  task: PropTypes.shape({
    color: PropTypes.string,
    label: PropTypes.string,
  }),
  /** Contains data used to display zone. */
  zone: PropTypes.arrayOf(
    PropTypes.shape({
      /** The coordinate of a point on the x-axis. */
      x: PropTypes.number.isRequired,
      /** The coordinate of a point on the y-axis. */
      y: PropTypes.number.isRequired,
    })
  ),
  isSelected: PropTypes.bool,
  imageWidth: PropTypes.number,
  imageHeight: PropTypes.number,
  annotationIndex: PropTypes.number,
  predictionIndex: PropTypes.number,
  index: PropTypes.number,
  scale: PropTypes.number,
  onValidateClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onSelectClick: PropTypes.func,
  onTransformEnd: PropTypes.func,
  onDragEnd: PropTypes.func,
}
