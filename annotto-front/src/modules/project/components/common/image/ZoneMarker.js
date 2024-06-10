import { flatten, isNumber } from 'lodash'
import PropTypes from 'prop-types'
import { useMemo, useRef, useState, useEffect } from 'react'
import { Group, Image, Line, Text, Transformer, Tag, Label } from 'react-konva'
import useImage from 'use-image'

import theme from '__theme__'

const ZoneMarker = ({
  index,
  tasks,
  annotationIndex,
  predictionIndex,
  zone,
  value,
  imageWidth,
  imageHeight,
  isSelected,
  scale,
  onValidateClick,
  onDeleteClick,
  onSelectClick,
  onTransformEnd,
  ...props
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

  const points = useMemo(
    () => flatten(zone.map(({ x, y }) => [x * imageWidth, y * imageHeight])),
    [zone, imageHeight, imageWidth]
  )

  const task = useMemo(() => {
    const currentTask = tasks.find((t) => t.value === value)
    if (currentTask && !currentTask?.color) {
      currentTask.color = theme.colors.defaultAnnotationColors[tasks.indexOf(currentTask)]
    }

    return currentTask
  }, [tasks, value])

  const findTopRightPoint = () =>
    zone.reduce((acc, point) => (point.x + acc.y > acc.x + point.y ? point : acc), zone[0])

  const findTopLeftPoint = () => zone.reduce((acc, point) => (acc.x + acc.y > point.x + point.y ? point : acc), zone[0])

  const styleZoom = useMemo(() => {
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
  }, [isHovered, task, isPrediction, isPrefill])

  useEffect(() => {
    if (isSelected && transformerRef.current && lineRef.current) {
      transformerRef.current.nodes([lineRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [isSelected, transformerRef.current, lineRef.current])

  const _onMouseEnter = () => setIsHovered(true)

  const _onMouseLeave = () => setIsHovered(false)

  if (!imageHeight && !imageWidth) {
    return null
  }

  return (
    <Group draggable={!isPrediction} onMouseEnter={_onMouseEnter} onMouseLeave={_onMouseLeave} {...props}>
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
          name={`zoom_${index}`}
          stroke={task.color}
          closed={true}
          points={points}
          ref={lineRef}
          {...styleZoom}
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

const TaskValue = PropTypes.string

const TaskSection = PropTypes.shape({
  /** Defines the label of the section. */
  name: PropTypes.string,
  /** Defines the values to display in the section. */
  values: PropTypes.arrayOf(
    PropTypes.shape({
      /** A machine-readable key that identifies the label in the backend, and that
       * is unique among the siblings of the task (but that can be used.
       * for other child nodes of other tasks). */
      value: TaskValue.isRequired,
      /** The text displayed in the list for annotators to recognise. */
      label: PropTypes.string.isRequired,
      /** A keyboard shortcut that is bound when the list is displayed to toggle.
       * this annotation. */
      hotkey: PropTypes.hotkey,
      /** The potential additional tasks that become available to the annotator.
       * once this task has been checked. */
      children: PropTypes.object, // TODO should be a TaskSection too. FIXME rename to childSection
      /** If a task is not top-level, it may contain shortcuts to the IDs.
       * of its parents to simplify algorithms. */
      parents: PropTypes.arrayOf(TaskValue),
    })
  ),
})

ZoneMarker.propTypes = {
  /** The hierarchy of labels that will be displayed in this list. Each section.
   * contains a title and multiple labels, which can themselves have children. */
  tasks: PropTypes.arrayOf(TaskSection),
  /** A machine-readable key that identifies the label in the backend, and that
   * is unique among the siblings of the task (but that can be used.
   * for other child nodes of other tasks). */
  value: TaskValue.isRequired,
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
}
