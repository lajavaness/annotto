import { isEmpty, isNumber } from 'lodash'
import PropTypes from 'prop-types'
import { useMemo, useRef, useState } from 'react'
import useImage from 'use-image'
import { Stage, Layer, Image, Rect } from 'react-konva'

import markerTypes, { TWO_POINTS } from 'shared/enums/markerTypes'

import Loader from 'shared/components/loader/Loader'
import ZoomMarker from 'modules/project/components/common/image/ZoomMark'

import useResolvedAnnotationsAndPredictions from 'shared/hooks/useResolvedAnnotationsAndPredictions'
import useZoomImage from 'shared/hooks/useZoomImage'

import { isZoneAnnotationEquivalent } from 'shared/utils/annotationUtils'

import * as Styled from './__styles__/ImageContainer.styles'

const ImageContainer = ({
  content,
  annotations,
  tasks,
  // selectedSection,
  // mode,
  showPredictions,
  predictions,
  onAnnotationChange,
}) => {
  const [currentAnnotations, setAnnotations] = useState([])
  const [newAnnotation, setNewAnnotation] = useState([])

  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)

  const observedDiv = useRef(null)
  const stageRef = useRef()

  const [image, status] = useImage(content)

  useZoomImage(observedDiv.current, stageRef.current, status, imageWidth, imageHeight)

  const resolvedAnnotationsAndPredictions = useResolvedAnnotationsAndPredictions(
    annotations,
    predictions,
    showPredictions
  )

  const _onImageRefChange = (ref) => {
    if (ref?.attrs?.image?.height !== imageHeight) setImageHeight(ref?.attrs?.image?.height)
    if (ref?.attrs?.image?.width !== imageWidth) setImageWidth(ref?.attrs?.image?.width)
  }

  const resolvedAnnotations = useMemo(
    () => (!isEmpty(annotations) ? annotations.filter(({ zone }) => !!zone) : []),
    [annotations]
  )

  const _onDeleteClick = (index) => () => {
    if (!!resolvedAnnotations[index] && !isEmpty(annotations) && !!onAnnotationChange) {
      const filteredAnnotations = annotations.filter(
        (annotation) => !isZoneAnnotationEquivalent(annotation, resolvedAnnotations[index])
      )

      onAnnotationChange(filteredAnnotations)
    }
  }

  const handleMouseDown = (event) => {
    if (event.target.attrs.name === 'delete') {
      return
    }

    if (newAnnotation.length === 0) {
      const { x, y } = event.target.getStage().getPointerPosition()

      setNewAnnotation([{ x, y, width: 0, height: 0, key: '0' }])
    }
  }

  const handleMouseUp = (event) => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x
      const sy = newAnnotation[0].y
      const { x, y } = event.target.getStage().getPointerPosition()
      const annotationToAdd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: currentAnnotations.length + 1,
      }
      currentAnnotations.push(annotationToAdd)
      setNewAnnotation([])
      setAnnotations(currentAnnotations)
    }
  }

  const handleMouseMove = (event) => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x
      const sy = newAnnotation[0].y
      const { x, y } = event.target.getStage().getPointerPosition()
      setNewAnnotation([
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          key: '0',
        },
      ])
    }
  }
  const annotationsToDraw = [...currentAnnotations, ...newAnnotation]

  return (
    <Styled.Root ref={observedDiv}>
      <div>
        <Stage ref={stageRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
          <Layer>
            <Image image={image} ref={_onImageRefChange} />
            {resolvedAnnotationsAndPredictions.map(({ zone, value, annotationIndex, predictionIndex }, index) => (
              <ZoomMarker
                key={index}
                index={index}
                tasks={tasks}
                imageHeight={imageHeight}
                imageWidth={imageWidth}
                annotationIndex={annotationIndex}
                predictionIndex={predictionIndex}
                zone={zone}
                value={value}
                stage={stageRef.current}
                onDeleteClick={_onDeleteClick(
                  isNumber(predictionIndex) && !annotationIndex ? predictionIndex : annotationIndex
                )}
              />
            ))}
            {annotationsToDraw
              .filter((v) => v.width)
              .map((value, i) => {
                const ratio = imageWidth / stageRef.current.attrs.width || 1

                return (
                  <Rect
                    key={i}
                    x={value.x * ratio}
                    y={value.y * ratio}
                    width={value.width * ratio}
                    height={value.height * ratio}
                    fill="transparent"
                    stroke="black"
                  />
                )
              })}
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
