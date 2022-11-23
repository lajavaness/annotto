import { CheckCircleFilled } from '@ant-design/icons'
import { Input } from 'antd'
import { debounce, isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import theme from '__theme__'

import * as Styled from './__styles__/TextAnnotationsContainer.styles'

const TextAnnotationsContainer = ({ tasks, annotations, onChange, showPredictions, predictions }) => {
	const rootRef = useRef()

	const [textAnnotations, setTextAnnotations] = useState([])

	const { t } = useTranslation('project')

	const resolvePrediction = useCallback(
		(value) => (!isEmpty(predictions) ? predictions.find((e) => e.value === value) : []),
		[predictions]
	)

	const resolveTextAnnotation = useCallback(
		(value) => textAnnotations.find((e) => e.value === value),
		[textAnnotations]
	)

	const updateAnnotations = useCallback(
		debounce((newAnnotations) => {
			return !!onChange && onChange(newAnnotations)
		}, 50),
		[onChange]
	)

	const updateTextAnnotations = useCallback(
		(taskValue, text) => {
			const filteredAnnotation = !isEmpty(annotations) ? annotations.filter(({ value }) => value !== taskValue) : []

			const newAnnotations = text ? [...filteredAnnotation, { value: taskValue, text }] : filteredAnnotation

			setTextAnnotations(newAnnotations)
			return updateAnnotations(newAnnotations)
		},
		[annotations, updateAnnotations]
	)

	useEffect(() => {
		setTextAnnotations(!isEmpty(annotations) ? annotations : [])
	}, [annotations])

	const _onChange = useCallback(
		(taskValue) =>
			({ target: { value: text } }) =>
				updateTextAnnotations(taskValue, text),
		[updateTextAnnotations]
	)

	const _onValidateClick = useCallback(
		(taskValue, text) => () => updateTextAnnotations(taskValue, text),
		[updateTextAnnotations]
	)

	return (
		<Styled.Root ref={rootRef}>
			{tasks.map(({ label, value }, index) => (
				<Styled.Container key={`${index}_${value}`}>
					<Styled.LabelContainer>
						{!isEmpty(predictions) && showPredictions && resolvePrediction(value) && (
							<Styled.PredictionIcon
								data-testid={`predictionIcon-${index}`}
								twoToneColor={theme.colors.predictionIconPrimary}
							/>
						)}
						<Styled.Label>{label}</Styled.Label>
					</Styled.LabelContainer>
					<Styled.TextAreaContainer>
						<Input.TextArea
							data-testid={`textAnnotationArea-${index}`}
							row={3}
							placeholder={
								(showPredictions && resolvePrediction(value)?.text) ||
								t('project:annotation.textAnnotation.placeholder')
							}
							allowClear
							onChange={_onChange(value)}
							value={resolveTextAnnotation(value)?.text}
						/>
						{showPredictions && !!resolvePrediction(value)?.text && !resolveTextAnnotation(value)?.value && (
							<Styled.ValidateButton
								type="ghost"
								onClick={_onValidateClick(value, resolvePrediction(value)?.text)}
								icon={<CheckCircleFilled />}
							/>
						)}
					</Styled.TextAreaContainer>
				</Styled.Container>
			))}
		</Styled.Root>
	)
}

export default TextAnnotationsContainer

const TaskValue = PropTypes.string

const TaskShape = PropTypes.shape({
	/** A machine-readable key that identifies the label in the backend, the value is unique.*/
	value: TaskValue.isRequired,
	/** The text displayed in the list for annotators to recognise. */
	label: PropTypes.string.isRequired,
})

TextAnnotationsContainer.propTypes = {
	/** Defines the tasks to display. */
	tasks: PropTypes.arrayOf(TaskShape),
	/** The list of value that are currently annotated. Callees must manage this
	 * list in their state. */
	annotations: PropTypes.arrayOf(
		PropTypes.shape({
			/** A machine-readable key that identifies the task value of an annotation in the backend,
			 * the value is unique. */
			value: TaskValue.isRequired,
			/** The text of an annotation. Displayed in the corresponding input. */
			text: PropTypes.string,
		})
	).isRequired,
	/** Define if predictions should appear on labels. */
	showPredictions: PropTypes.bool,
	/** Defines the values of predictions. */
	predictions: PropTypes.arrayOf(
		PropTypes.shape({
			/** A machine-readable key that identifies the task value of an annotation in the backend,
			 * the value is unique. */
			value: TaskValue.isRequired,
			/** The text of an annotation. Displayed in the corresponding input. */
			text: PropTypes.string,
		})
	),
	/** A callback that will be called whenever a label is annotated or unannotated.
	 * Contains the updated list of annotated ids as the first parameter. */
	onChange: PropTypes.func,
}

TextAnnotationsContainer.defaultProps = {
	tasks: [],
	annotations: [],
	onChange: null,
	showPredictions: true,
	predictions: [],
}
