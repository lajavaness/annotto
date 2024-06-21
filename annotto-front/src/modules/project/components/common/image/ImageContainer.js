import { isEmpty, isNumber, chunk, find, isEqual } from 'lodash'
import PropTypes from 'prop-types'
import { useEffect, useMemo, useRef, useState } from 'react'
import useImage from 'use-image'
import { Stage, Layer, Image, Rect, Line } from 'react-konva'

import markerTypes, { FOUR_POINTS, POLYGON, TWO_POINTS } from 'shared/enums/markerTypes'

import Loader from 'shared/components/loader/Loader'
import ZoneMarker from 'modules/project/components/common/image/ZoneMarker'
import AnchorPoint from 'modules/project/components/common/image/AnchorPoint'

import useResolvedAnnotationsAndPredictions from 'shared/hooks/useResolvedAnnotationsAndPredictions'
import useZoomImage from 'shared/hooks/useZoomImage'

import { isZoneAnnotationEquivalent } from 'shared/utils/annotationUtils'

import * as Styled from './__styles__/ImageContainer.styles'

const ImageContainer = ({
  content,
  annotations,
  tasks,
  selectedSection,
  mode,
  showPredictions,
  predictions,
  onAnnotationChange,
}) => {
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)
  const [scale, setScale] = useState(0)
  const [curMousePolygonPos, setCurMousePolygonPos] = useState([0, 0])
  const [moveLayerPos, setMoveLayerPos] = useState({ x: 0, y: 0 })
  const [curMouseRectPos, setCurMouseRectPos] = useState([])
  const [polygonPoints, setPolygonPoints] = useState([])
  const [isMouseOverStartPoint, setMouseOverStartPoint] = useState(false)
  const [selectRoomId, setSelectRoomId] = useState()

  const observedDiv = useRef()
  const stageRef = useRef()

  const [image, status] = useImage(content)

  useZoomImage(observedDiv.current, stageRef.current, status, imageWidth, imageHeight, moveLayerPos)

  useEffect(() => {
    setPolygonPoints([])
    setCurMouseRectPos([])
  }, [content, mode, selectedSection])

  useEffect(() => {
    setScale(0)
  }, [content])

  const resolvedAnnotationsAndPredictions = useResolvedAnnotationsAndPredictions(
    annotations,
    predictions,
    showPredictions,
    tasks
  )

  const resolvedAnnotations = useMemo(
    () => (!isEmpty(annotations) ? annotations.filter(({ zone }) => !!zone) : []),
    [annotations]
  )

  const flattenedPoints = useMemo(
    () => polygonPoints.concat(polygonPoints.length === 2 ? [] : curMousePolygonPos).reduce((a, b) => a.concat(b), []),
    [polygonPoints, curMousePolygonPos]
  )

  const createPolygon = () => {
    const annotationToAdd = {
      zone: chunk(polygonPoints, 2).map((point) => ({ x: point[0] / imageWidth, y: point[1] / imageHeight })),
      value: selectedSection.value,
    }
    onAnnotationChange([...annotations, annotationToAdd])
    setPolygonPoints([])
    setCurMousePolygonPos([0, 0])
    setMouseOverStartPoint(false)
  }

  const _onSelectRoomId = (id) => () => setSelectRoomId(id)

  const _onImageRefChange = (ref) => {
    if (ref?.attrs?.image?.height !== imageHeight) setImageHeight(ref?.attrs?.image?.height)
    if (ref?.attrs?.image?.width !== imageWidth) setImageWidth(ref?.attrs?.image?.width)
  }

  const _onDeleteClick = (index) => () => {
    if (!!resolvedAnnotations[index] && !isEmpty(annotations) && !!onAnnotationChange) {
      const filteredAnnotations = annotations.filter(
        (annotation) => !isZoneAnnotationEquivalent(annotation, resolvedAnnotations[index])
      )

      onAnnotationChange(filteredAnnotations)
    }
  }

  const _onValidateClick = (index) => () => {
    if (!isEmpty(annotations) && !!onAnnotationChange) {
      onAnnotationChange([...annotations, predictions.filter(({ zone }) => !!zone)?.[index]])
    }
  }

  const _handleMouseDown = (event) => {
    if (!event.target.attrs.name) {
      setSelectRoomId()
    }

    if (event.target.attrs.name === 'actionIcon' || !selectedSection) {
      return
    }

    const ratio = event.target.getStage().scaleX()
    const { x, y } = {
      x: event.target.getStage().getPointerPosition().x / ratio,
      y: event.target.getStage().getPointerPosition().y / ratio,
    }
    const { attrsX, attrsY } = {
      attrsX: event.target.getStage().attrs.x / ratio || 0,
      attrsY: event.target.getStage().attrs.y / ratio || 0,
    }

    if (mode === TWO_POINTS && curMouseRectPos.length === 0) {
      setCurMouseRectPos([
        {
          x: x - attrsX - moveLayerPos.x,
          y: y - attrsY - moveLayerPos.y,
          width: 0,
          height: 0,
        },
      ])
    }

    if (mode === FOUR_POINTS) {
      if (polygonPoints.length === 8) {
        createPolygon()
      } else {
        setPolygonPoints((prevState) => {
          if (
            prevState[prevState.length - 2] === x - attrsX - moveLayerPos.x &&
            prevState[prevState.length - 1] === y - attrsY - moveLayerPos.y
          ) {
            return prevState
          }
          return [...prevState, x - attrsX - moveLayerPos.x, y - attrsY - moveLayerPos.y]
        })
      }
    }

    if (mode === POLYGON) {
      if (isMouseOverStartPoint && polygonPoints.length >= 8) {
        createPolygon()
      } else {
        setPolygonPoints((prevState) => {
          if (
            prevState[prevState.length - 2] === x - attrsX - moveLayerPos.x &&
            prevState[prevState.length - 1] === y - attrsY - moveLayerPos.y
          ) {
            return prevState
          }
          return [...prevState, x - attrsX - moveLayerPos.x, y - attrsY - moveLayerPos.y]
        })
      }
    }
  }

  const _handleMouseUp = (event) => {
    if (curMouseRectPos.length === 1) {
      const ratio = event.target.getStage().scaleX()

      const { x: firstX, y: firstY } = curMouseRectPos[0]
      const { secondX, secondY } = {
        secondX: event.target.getStage().getPointerPosition().x / ratio,
        secondY: event.target.getStage().getPointerPosition().y / ratio,
      }
      const { attrsX, attrsY } = {
        attrsX: event.target.getStage().attrs.x / ratio || 0,
        attrsY: event.target.getStage().attrs.y / ratio || 0,
      }
      if (
        Math.abs(secondX - attrsX - moveLayerPos.x - firstX) < 10 ||
        Math.abs(secondY - attrsY - moveLayerPos.y - firstY) < 10
      ) {
        setCurMouseRectPos([])
        return
      }

      const annotationToAdd = {
        zone: [
          { x: firstX / imageWidth, y: firstY / imageHeight },
          { x: (secondX - attrsX - moveLayerPos.x) / imageWidth, y: firstY / imageHeight },
          { x: (secondX - attrsX - moveLayerPos.x) / imageWidth, y: (secondY - attrsY - moveLayerPos.y) / imageHeight },
          { x: firstX / imageWidth, y: (secondY - attrsY - moveLayerPos.y) / imageHeight },
        ],
        value: selectedSection.value,
      }

      onAnnotationChange([...annotations, annotationToAdd])
      setCurMouseRectPos([])
    }
  }

  const _handleMouseMove = (event) => {
    const ratio = event.target.getStage().scaleX()
    const { x, y } = {
      x: event.target.getStage().getPointerPosition().x / ratio,
      y: event.target.getStage().getPointerPosition().y / ratio,
    }
    const { attrsX, attrsY } = {
      attrsX: event.target.getStage().attrs.x / ratio || 0,
      attrsY: event.target.getStage().attrs.y / ratio || 0,
    }

    if (mode === TWO_POINTS && curMouseRectPos.length === 1) {
      const { x: firstX, y: firstY } = curMouseRectPos[0]

      setCurMouseRectPos([
        {
          x: firstX,
          y: firstY,
          width: x - firstX - attrsX - moveLayerPos.x,
          height: y - firstY - attrsY - moveLayerPos.y,
        },
      ])
    }

    if (mode !== TWO_POINTS && polygonPoints.length >= 2) {
      setCurMousePolygonPos([x - attrsX - moveLayerPos.x, y - attrsY - moveLayerPos.y])
    }
  }

  const _handleMouseOverStartPoint = (event) => {
    if (polygonPoints.length < 8) return
    event.target.scale({ x: 2, y: 2 })
    setMouseOverStartPoint(true)
  }

  const _handleMouseOutStartPoint = (event) => {
    event.target.scale({ x: 1, y: 1 })
    setMouseOverStartPoint(false)
  }

  const _onDragImageEnd = (zone, value) => (event) => {
    if (event.target.attrs.name === 'anchorPoint') {
      return
    }

    const { x, y } = event.target.attrs
    const currentAnnotation = find(annotations, (v) => isEqual(v.value, value) && isEqual(v.zone, zone))

    const annotationToAdd = {
      zone: currentAnnotation.zone.map((point) => ({ x: point.x + x / imageWidth, y: point.y + y / imageHeight })),
      value,
    }
    onAnnotationChange([
      ...annotations.filter((v) => !(isEqual(v.value, value) && isEqual(v.zone, zone))),
      annotationToAdd,
    ])
  }

  const _onDragLayerEnd = (event) => {
    if (!['anchorPoint', 'zoneMarker'].includes(event.target.attrs.name)) {
      const { x, y } = event.target.attrs
      setMoveLayerPos({ x, y })
    }
  }

  const _onTransformEnd = (zone, value) => (event, transformPoints) => {
    const points = transformPoints || event.target.getPoints()
    const { scaleX, scaleY } = event.target.attrs
    if (!scaleX && !scaleY) {
      return
    }

    const { attrsX, attrsY } = transformPoints
      ? { attrsX: 0, attrsY: 0 }
      : {
          attrsX: event.target.attrs.x / imageWidth || 0,
          attrsY: event.target.attrs.y / imageHeight || 0,
        }

    const annotationToAdd = {
      zone: chunk(points, 2).map((point) => ({
        x: (point[0] / imageWidth) * scaleX + attrsX,
        y: (point[1] / imageHeight) * scaleY + attrsY,
      })),
      value,
    }

    onAnnotationChange([
      ...annotations.filter((v) => !(isEqual(v.value, value) && isEqual(v.zone, zone))),
      annotationToAdd,
    ])
  }
  const _onLayerWheel = (event) => {
    setScale(event.target.getStage().scaleX())
  }

  return (
    <Styled.Root ref={observedDiv} data-testid={'__image-item__'}>
      <Stage
        ref={stageRef}
        onMouseDown={_handleMouseDown}
        onWheel={_onLayerWheel}
        {...(selectedSection ? { onMouseUp: _handleMouseUp, onMouseMove: _handleMouseMove } : {})}
      >
        <Layer draggable={!selectedSection} onDragEnd={_onDragLayerEnd}>
          <Image image={image} ref={_onImageRefChange} />
          {!!imageHeight && (
            <>
              {resolvedAnnotationsAndPredictions.map(
                ({ zone, value, annotationIndex, predictionIndex, task }, index) => (
                  <ZoneMarker
                    key={index}
                    index={index}
                    task={task}
                    imageHeight={imageHeight}
                    imageWidth={imageWidth}
                    annotationIndex={annotationIndex}
                    predictionIndex={predictionIndex}
                    zone={zone}
                    value={value}
                    scale={scale || stageRef.current?.scaleX()}
                    isSelected={selectRoomId === index}
                    onDeleteClick={_onDeleteClick(
                      isNumber(predictionIndex) && !annotationIndex ? predictionIndex : annotationIndex
                    )}
                    onValidateClick={_onValidateClick(predictionIndex)}
                    onDragEnd={_onDragImageEnd(zone, value)}
                    onTransformEnd={_onTransformEnd(zone, value)}
                    onSelectClick={_onSelectRoomId(index)}
                  />
                )
              )}
              {curMouseRectPos
                .filter((v) => v.width)
                .map((value, index) => {
                  return (
                    <Rect
                      fill="transparent"
                      key={index}
                      x={value.x}
                      y={value.y}
                      width={value.width}
                      height={value.height}
                      stroke={selectedSection?.color}
                    />
                  )
                })}
              {selectedSection && mode !== TWO_POINTS && (
                <Line
                  lineCap="round"
                  lineJoin="round"
                  strokeWidth={4}
                  points={flattenedPoints}
                  stroke={selectedSection?.color}
                />
              )}

              {chunk(polygonPoints, 2).map((point, index) => {
                return (
                  <AnchorPoint
                    key={index}
                    imageWidth={1}
                    imageHeight={1}
                    color={selectedSection?.color}
                    point={{
                      x: point[0],
                      y: point[1],
                    }}
                    {...(index === 0
                      ? { onMouseOver: _handleMouseOverStartPoint, onMouseOut: _handleMouseOutStartPoint }
                      : {})}
                  />
                )
              })}
            </>
          )}
        </Layer>
      </Stage>
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
