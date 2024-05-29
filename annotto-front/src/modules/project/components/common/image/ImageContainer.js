import { flatten, min } from 'lodash'
import PropTypes from 'prop-types'
import { useCallback, useRef, useState } from 'react'
import useImage from 'use-image'
import { Stage, Layer, Image, Group, Line } from 'react-konva'

import markerTypes, { TWO_POINTS } from 'shared/enums/markerTypes'

import Loader from 'shared/components/loader/Loader'

import useResolvedAnnotationsAndPredictions from 'shared/hooks/useResolvedAnnotationsAndPredictions'
import useZoomImage from 'shared/hooks/useZoomImage'

import theme from '__theme__'

import * as Styled from './__styles__/ImageContainer.styles'

const ImageContainer = ({
  content,
  annotations,
  tasks,
  // selectedSection,
  // mode,
  showPredictions,
  predictions,
  // onAnnotationChange,
}) => {
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)

  const observedDiv = useRef(null)
  const stageRef = useRef()
  const imageRef = useRef()

  const [image, status] = useImage(content)
  const [tagIcon] = useImage(`${process.env.PUBLIC_URL}/static/images/tag.svg`)

  useZoomImage(observedDiv.current, stageRef.current)
  const resolvedAnnotationsAndPredictions = useResolvedAnnotationsAndPredictions(
    annotations,
    predictions,
    showPredictions
  )
  const resolvePoints = (values) => flatten(values.map(({ x, y }) => [x * imageHeight, y * imageWidth]))

  console.log(resolvedAnnotationsAndPredictions, 123, imageRef.current?.attrs?.image, status, imageHeight, imageWidth)

  const _onImageRefChange = (ref) => {
    if (ref?.attrs?.image?.height !== imageHeight) setImageHeight(ref?.attrs?.image?.height)
    if (ref?.attrs?.image?.width !== imageWidth) setImageWidth(ref?.attrs?.image?.width)
  }

  const resolveTask = useCallback(
    (value) => {
      const task = tasks.find((t) => t.value === value)

      if (task && !task?.color) {
        task.color = theme.colors.defaultAnnotationColors[tasks.indexOf(task)]
      }

      return task
    },
    [tasks]
  )

  return (
    <Styled.Root ref={observedDiv}>
      <div>
        <Stage ref={stageRef}>
          <Layer draggable>
            <Image image={image} ref={_onImageRefChange} />
            <Group>
              {resolvedAnnotationsAndPredictions.map(({ zone, value }, index) => {
                // const isHovered = index === 11
                // const isSelected = index === 11

                const task = resolveTask(value)
                // const isPrefill = isNumber(annotationIndex) && isNumber(predictionIndex)
                // const isPrediction = isNumber(predictionIndex) && !isNumber(annotationIndex)
                return (
                  <Group key={index} position="relative" draggable>
                    <Image
                      width={24}
                      height={24}
                      image={tagIcon}
                      position="absolute"
                      x={min(zone.map(({ x }) => x * imageHeight))}
                      y={min(zone.map(({ y }) => y * imageWidth))}
                    />
                    <Line
                      stroke={task.color}
                      dash={[33, 10]}
                      fill="transparent"
                      closed={true}
                      points={resolvePoints(zone)}
                    />
                  </Group>
                )
              })}
            </Group>
          </Layer>
        </Stage>
      </div>
      {status !== 'loaded' && <Loader />}
    </Styled.Root>
  )
}

export default ImageContainer

const TaskValue = PropTypes.string

const TaskSection = PropTypes.shape({
  /** Defines the label of the section. */
  name: PropTypes.string,
  /** Defines the values to display in the section. */
  // FIXME rename values to labels / classes
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

ImageContainer.propTypes = {
  /** Defines the source path of the image that will be displayed. */
  content: PropTypes.string,
  /** The list of the annotation that are currently selected. Callees must manage this.
   * list in their state. */
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
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
    })
  ),
  /** The hierarchy of labels that will be displayed in this list. Each section.
   * contains a title and multiple labels, which can themselves have children. */
  tasks: PropTypes.arrayOf(TaskSection),
  /** Defines which selectedSection to annotate. */
  selectedSection: PropTypes.shape({
    /** Defines the ID for selectedSection. */
    _id: PropTypes.string,
    /** Defines the value of the task. */
    value: PropTypes.string,
    /** A color string that will be applied to the annotation zone. */
    color: PropTypes.string,
  }),
  /** Defines if predictions should appear. */
  showPredictions: PropTypes.bool,
  /** Defines The list of the predictions of the current item. This is used to display the predictions.
   * but also to find the annotations which are also predictions. */
  predictions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      zone: PropTypes.arrayOf(
        PropTypes.shape({
          x: PropTypes.number,
          y: PropTypes.number,
        })
      ),
    })
  ),
  /** Defines the mode of annotation, if the annotation is with 2,4 or multiple points. */
  mode: PropTypes.oneOf(markerTypes),
  /** A callback that will be called whenever a zone is created or removed.
   * Contains the updated list of annotation. */
  onAnnotationChange: PropTypes.func,
}

ImageContainer.defaultProps = {
  content: null,
  annotations: [],
  selectedSection: null,
  mode: TWO_POINTS,
  showPredictions: true,
  predictions: [],
  onAnnotationChange: null,
}
