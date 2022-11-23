import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { isEmpty, isNumber } from 'lodash'
import PropTypes from 'prop-types'
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import useOutsideClick from 'shared/hooks/useOutsideClick'

import markerTypes, { FOUR_POINTS, POLYGON, TWO_POINTS } from 'shared/enums/markerTypes'

import { isZoneAnnotationEquivalent } from 'shared/utils/annotationUtils'

import Loader from 'shared/components/loader/Loader'

import theme from '__theme__'

import * as Styled from './__styles__/ImageMarker.styles'

const ImageMarker = ({ src, annotations, tasks, selectedSection, mode, showPredictions, predictions, onChange }) => {
	const rootRef = useRef()
	const imgRef = useRef()

	const [markerRefs, setMarkerRefs] = useState([])
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
	const [currentSelected, setCurrentSelected] = useState(null)
	const [currentHovered, setCurrentHovered] = useState(null)
	const [draggedCoords, setDraggedCoords] = useState([])
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const [isImageLoaded, setIsImageLoaded] = useState(false)

	useOutsideClick(rootRef, () => {
		if (!isEmpty(draggedCoords)) {
			onChange(annotations)
			setDraggedCoords([])
		}
	})

	useEffect(() => {
		setIsImageLoaded(false)
		setCurrentHovered(null)
		setCurrentSelected(null)
		setMarkerRefs([])
	}, [src])

	const resolveFourPoints = ([{ x: x1, y: y1 }, { x: x2, y: y2 }]) => [
		{ x: x1, y: y1 },
		{ x: x2, y: y1 },
		{ x: x2, y: y2 },
		{ x: x1, y: y2 },
	]

	const resolvedAnnotations = useMemo(
		() => (!isEmpty(annotations) ? annotations.filter(({ zone }) => !!zone) : []),
		[annotations]
	)

	const resolvedPredictions = useMemo(
		() => (!isEmpty(predictions) ? predictions.filter(({ zone }) => !!zone) : []),
		[predictions]
	)

	const resolvedAnnotationsAndPredictions = useMemo(() => {
		const resolvePredictionIndex = (predictionToFind) =>
			resolvedPredictions.findIndex((prediction) => isZoneAnnotationEquivalent(prediction, predictionToFind))

		const updatedAnnotations = resolvedAnnotations.map((annotation, annotationIndex) => {
			const predictionIndex = resolvePredictionIndex(annotation)

			return {
				...annotation,
				annotationIndex,
				predictionIndex: predictionIndex >= 0 ? predictionIndex : null,
			}
		})

		const updatedPredictions = showPredictions
			? resolvedPredictions
					.filter(
						(prediction) =>
							!resolvedAnnotations.some((annotation) => isZoneAnnotationEquivalent(prediction, annotation))
					)
					.map((prediction) => ({
						...prediction,
						predictionIndex: resolvePredictionIndex(prediction),
					}))
			: []

		return [...updatedAnnotations, ...updatedPredictions]
	}, [showPredictions, resolvedAnnotations, resolvedPredictions])

	useEffect(() => {
		setMarkerRefs((markerRefs) =>
			Array(resolvedAnnotationsAndPredictions.length)
				.fill()
				.map((marker, i) => markerRefs[i] || createRef())
		)
	}, [resolvedAnnotationsAndPredictions])

	const addPoint = useCallback(
		(pos) => {
			if (!isEmpty(selectedSection)) {
				let coords = [...draggedCoords, pos]
				const isSamePoint = (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y) < 0.02

				if (
					(mode === TWO_POINTS && coords.length === 2) ||
					(mode === FOUR_POINTS && coords.length === 4) ||
					(mode === POLYGON && coords.length >= 3 && isSamePoint(coords[0], coords[coords.length - 1]))
				) {
					if (mode === TWO_POINTS) {
						coords = resolveFourPoints(coords)
					}

					setDraggedCoords([])

					if (coords.every((coord, i) => i === 0 || isSamePoint(coords[i - 1], coord))) return

					onChange([...annotations, { value: selectedSection.value, zone: coords }])
				} else {
					setDraggedCoords(coords)
				}
			}
		},
		[draggedCoords, selectedSection, onChange, annotations, mode]
	)

	const drawingPoints = useMemo(() => {
		let points = [...draggedCoords, mousePosition]
		if (points.length >= 2) {
			if (points.length === 2) {
				if (mode === TWO_POINTS) {
					points = resolveFourPoints(points)
				} else {
					const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = points
					points = [...points, { x: x2 + 0.003, y: y2 + 0.003 }, { x: x1 + 0.003, y: y1 + 0.003 }]
				}
			}
		}

		return points
	}, [draggedCoords, mousePosition, mode])

	const resolveTextPosition = useCallback((points) => {
		const highestPoints = points.reduce(
			(min, [x, y]) => (y <= min[1] && !(min[1] === y && min[0] < x) ? [x, y] : min),
			points[0]
		)

		const isRect = points.filter(([x]) => highestPoints[0] === x).length > 1

		return { x: highestPoints[0], y: highestPoints[1], isRect }
	}, [])

	const resolveMarkerWidth = (points) => {
		const rightmostPoint = points.reduce((max, [x]) => (x > max ? x : max), points[0][0])
		const leftmostPoint = points.reduce((min, [x]) => (x < min ? x : min), points[0][0])

		return rightmostPoint - leftmostPoint
	}

	const resolveSplitedPoints = (points) =>
		points.split(' ').map((point) => point.split(',').map((point) => Number(point)))

	const resolvePoints = useCallback(
		(values) =>
			values
				.map(({ x, y }) => [x * dimensions.width, y * dimensions.height])
				.map((x) => Number(x[0]) + ',' + Number(x[1]))
				.join(' '),
		[dimensions]
	)

	const resolveTask = useCallback(
		(value) => {
			const task = tasks.find((task) => task.value === value)

			if (task && !task?.color) {
				task.color = theme.colors.defaultAnnotationColors[tasks.indexOf(task)]
			}

			return task
		},
		[tasks]
	)
	const isMarkerContainsTarget = useCallback((node, nodeToFind) => {
		if (node && node.contains(nodeToFind)) {
			return true
		} else {
			return node?.firstChild ? isMarkerContainsTarget(node.firstChild, nodeToFind) : false
		}
	}, [])

	const _onWindowResize = useCallback(
		() => setDimensions({ width: imgRef.current.offsetWidth, height: imgRef.current.offsetHeight }),
		[imgRef]
	)

	useEffect(() => {
		if (imgRef.current && imgRef.current.complete && isImageLoaded) {
			_onWindowResize()
			window.addEventListener('resize', _onWindowResize)
		}
		return () => {
			window.removeEventListener('resize', _onWindowResize)
		}
	}, [isImageLoaded, _onWindowResize])

	const _onLoad = () => setIsImageLoaded(true)

	const _onMouseMove = useCallback(
		({ target, nativeEvent }) => {
			return (
				!isEmpty(selectedSection) &&
				!markerRefs.some(({ current }) => current === target.parentElement) &&
				!markerRefs.some(({ current }) => isMarkerContainsTarget(current, target)) &&
				setMousePosition({ x: nativeEvent.offsetX / dimensions.width, y: nativeEvent.offsetY / dimensions.height })
			)
		},
		[selectedSection, markerRefs, isMarkerContainsTarget, dimensions]
	)

	const _onMouseUp = useCallback(
		({ target, nativeEvent }) =>
			!isEmpty(selectedSection) &&
			!markerRefs.some(({ current }) => current === target.parentElement) &&
			!markerRefs.some(({ current }) => isMarkerContainsTarget(current, target)) &&
			addPoint({
				x: nativeEvent.offsetX / dimensions.width,
				y: nativeEvent.offsetY / dimensions.height,
			}),
		[addPoint, markerRefs, dimensions, isMarkerContainsTarget, selectedSection]
	)

	const _onDeleteClick = useCallback(
		(index) => (e) => {
			e.stopPropagation()
			if (!!resolvedAnnotations[index] && !isEmpty(annotations) && !!onChange) {
				const filteredAnnotations = annotations.filter(
					(annotation) => !isZoneAnnotationEquivalent(annotation, resolvedAnnotations[index])
				)
				if (index === currentSelected) {
					setCurrentSelected(null)
				}

				if (index === currentHovered) {
					setCurrentHovered(null)
				}
				onChange(filteredAnnotations)
			}
		},
		[onChange, currentSelected, currentHovered, annotations, resolvedAnnotations]
	)

	const _onValidateClick = useCallback(
		(index) => (e) => {
			e.stopPropagation()
			if (!!resolvedPredictions[index] && !!onChange) {
				if (index === currentSelected) {
					setCurrentSelected(null)
				}

				if (index === currentHovered) {
					setCurrentHovered(null)
				}

				onChange([...annotations, resolvedPredictions[index]])
			}
		},
		[annotations, currentSelected, currentHovered, onChange, resolvedPredictions]
	)

	const resolveBackgroundPredictionPattern = (annotationIndex, predictionIndex, isSelected, isHovered, color) =>
		!isNumber(annotationIndex) &&
		isNumber(predictionIndex) && (
			<defs>
				<pattern
					id={`pattern_${annotationIndex || predictionIndex}`}
					x="0"
					y="0"
					width="20"
					height="20"
					patternUnits="userSpaceOnUse"
				>
					<Styled.PredictionRectPattern x="0" y="0" $color={color} $isSelected={isSelected} $isHovered={isHovered} />
					<Styled.PredictionRectPattern x="10" y="10" $color={color} $isSelected={isSelected} $isHovered={isHovered} />
				</pattern>
			</defs>
		)

	const resolveMarkerHeader = useCallback(
		(label, color, isRect, index, isPrediction, isPrefill) => (
			<>
				<Styled.MarkerLabel xmlns="http://www.w3.org/1999/xhtml" backgroundcolor={color} $isRect={isRect}>
					{(isPrediction || isPrefill) && <Styled.PredictionIcon />}
					{label}
				</Styled.MarkerLabel>
				<Styled.ActionButton
					onClick={isPrediction && !isPrefill ? _onValidateClick(index) : _onDeleteClick(index)}
					icon={isPrediction && !isPrefill ? <CheckOutlined /> : <CloseOutlined />}
					type="primary"
					shape="circle"
				/>
			</>
		),
		[_onValidateClick, _onDeleteClick]
	)

	const _onMarkerClick = useCallback(
		(index) => () => {
			if (currentSelected === index) {
				setCurrentSelected(null)
				setCurrentHovered(index)
			} else {
				setCurrentHovered(null)
				setCurrentSelected(index)
			}
		},
		[currentSelected]
	)

	const _onMouseOver = useCallback(
		(index) => () => {
			if (currentSelected === index) {
				setCurrentHovered(null)
			} else {
				setCurrentHovered(index)
			}
		},
		[currentSelected]
	)

	const _onMouseLeave = () => setCurrentHovered(null)

	return (
		<Styled.Root ref={rootRef} $haveDraggedMarker={draggedCoords.length > 0}>
			<Styled.Img ref={imgRef} src={src} onLoad={_onLoad} />
			<Styled.Svg
				data-testid="__markers-container__"
				dimensions={dimensions}
				onMouseUp={_onMouseUp}
				onMouseMove={_onMouseMove}
			>
				{resolvedAnnotationsAndPredictions.map(({ annotationIndex, predictionIndex, zone, value }, index) => {
					const isHovered = currentHovered === index
					const isSelected = currentSelected === index
					const points = resolveSplitedPoints(resolvePoints(zone))
					const textPosition = resolveTextPosition(points)
					const markerWidth = resolveMarkerWidth(points)
					const task = resolveTask(value)
					const isPrefill = isNumber(annotationIndex) && isNumber(predictionIndex)
					const isPrediction = isNumber(predictionIndex) && !isNumber(annotationIndex)

					return (
						<g
							key={index}
							ref={markerRefs[index]}
							onMouseOver={_onMouseOver(index)}
							onMouseLeave={_onMouseLeave}
							onClick={_onMarkerClick(index)}
						>
							<Styled.Polygon
								data-testid="__markers__"
								points={resolvePoints(zone)}
								stroke={task.color}
								fill={task.color}
								$isHovered={isHovered}
								index={annotationIndex || predictionIndex}
								$isSelected={isSelected}
								$isPrediction={isPrediction}
								$isPrefill={isPrefill}
							/>
							{resolveBackgroundPredictionPattern(annotationIndex, predictionIndex, isSelected, isHovered, task.color)}
							{(isSelected || isHovered) && (
								<Styled.MarkerHeaderContainer
									x={textPosition.x}
									y={textPosition.y}
									width={markerWidth}
									$isHovered={isHovered}
									$isSelected={isSelected}
								>
									{!textPosition.isRect ? (
										<Styled.MarkerLabelContainer>
											{resolveMarkerHeader(
												task.label,
												task.color,
												textPosition.isRect,
												isNumber(predictionIndex) && !annotationIndex ? predictionIndex : annotationIndex,
												isPrediction && showPredictions,
												isPrefill
											)}
										</Styled.MarkerLabelContainer>
									) : (
										resolveMarkerHeader(
											task.label,
											task.color,
											textPosition.isRect,
											isNumber(predictionIndex) && !annotationIndex ? predictionIndex : annotationIndex,
											isPrediction && showPredictions,
											isPrefill
										)
									)}
								</Styled.MarkerHeaderContainer>
							)}
							{!isHovered && !isSelected && (isPrediction || isPrefill) && (
								<Styled.PredictionIconContainer x={textPosition.x} y={textPosition.y} width={markerWidth}>
									<Styled.PredictionIcon color={task.color} />
								</Styled.PredictionIconContainer>
							)}
						</g>
					)
				})}
				{draggedCoords.length > 0 && (
					<g>
						<Styled.DraggedPolygon
							fill={resolveTask(selectedSection.value).color}
							points={resolvePoints(drawingPoints)}
						/>
					</g>
				)}
			</Styled.Svg>
			{!isImageLoaded && <Loader />}
		</Styled.Root>
	)
}

export default ImageMarker

const TaskValue = PropTypes.string

const TaskSection = PropTypes.shape({
	/** Defines the label of the section. */
	name: PropTypes.string,
	/** Defines the values to display in the section. */
	// FIXME rename values to labels / classes
	values: PropTypes.arrayOf(
		PropTypes.shape({
			/** A machine-readable key that identifies the label in the backend, and that
			 * is unique among the siblings of the task (but that can be used
			 * for other child nodes of other tasks). */
			value: TaskValue.isRequired,
			/** The text displayed in the list for annotators to recognise. */
			label: PropTypes.string.isRequired,
			/** A keyboard shortcut that is bound when the list is displayed to toggle
			 * this annotation. */
			hotkey: PropTypes.hotkey,
			/** The potential additional tasks that become available to the annotator
			 * once this task has been checked. */
			children: PropTypes.object, // TODO should be a TaskSection too. FIXME rename to childSection
			/** If a task is not top-level, it may contain shortcuts to the IDs
			 * of its parents to simplify algorithms. */
			parents: PropTypes.arrayOf(TaskValue),
		})
	),
})

ImageMarker.propTypes = {
	/** Defines the source path of the image that will be displayed. */
	src: PropTypes.string,
	/** The list of the annotation that are currently selected. Callees must manage this
	 * list in their state. */
	annotations: PropTypes.arrayOf(
		PropTypes.shape({
			/** A machine-readable key that identifies the label in the backend, and that
			 * is unique among the siblings of the task (but that can be used
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
	/** The hierarchy of labels that will be displayed in this list. Each section
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
	/** Defines The list of the predictions of the current item. This is used to display the predictions
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
	onChange: PropTypes.func,
}

ImageMarker.defaultProps = {
	src: null,
	annotations: [],
	selectedSection: null,
	mode: TWO_POINTS,
	showPredictions: true,
	predictions: [],
	onChange: null,
}
