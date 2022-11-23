import { ThemeProvider } from 'styled-components'
import { cleanup, fireEvent, render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import TextAnnotationsContainer from 'modules/project/components/common/TextAnnotationsContainer'

const defaultProps = {}
const getInstance = (props = {}) => (
	<ThemeProvider theme={theme}>
		<TextAnnotationsContainer {...defaultProps} {...props} />
	</ThemeProvider>
)

const tasks = [
	{
		value: 'foo',
		label: 'foo',
	},
	{
		value: 'bar',
		label: 'bar',
	},
]
const annotations = [
	{
		value: 'foo',
		text: 'foo_text',
	},
	{
		value: 'bar',
		text: 'bar_text',
	},
]
const showPredictions = true
const predictions = [
	{
		value: 'foo',
		text: 'foo_text',
	},
	{
		value: 'bar',
		text: 'bar_text',
	},
]
const onChange = jest.fn()

describe('TextAnnotationsContainer', () => {
	jest.useFakeTimers()
	afterEach(cleanup)

	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})

	it('matches snapshot with props', () => {
		const { asFragment } = render(getInstance({ tasks, annotations, onChange, showPredictions, predictions }))
		expect(asFragment()).toMatchSnapshot()
	})

	it('render labels of tasks', () => {
		const { getByText } = render(getInstance({ tasks }))
		tasks.forEach(({ label }) => expect(getByText(label)).toBeVisible())
	})

	it('render annotations', () => {
		const { getByText } = render(getInstance({ tasks, annotations }))
		annotations.forEach(({ text }) => expect(getByText(text)).toBeVisible())
	})

	it('render predictions when no annotations', () => {
		const { getByPlaceholderText } = render(getInstance({ tasks, predictions }))
		predictions.forEach(({ text }) => expect(getByPlaceholderText(text)).toBeVisible())
	})

	it('render predictionIcon if prediction and show prediction', () => {
		const { getByTestId } = render(getInstance({ tasks, predictions, showPredictions }))
		predictions.forEach((prediction, index) => expect(getByTestId(`predictionIcon-${index}`)).toBeVisible())
	})

	it('triggers onChange callback', () => {
		const { getByTestId } = render(getInstance({ tasks, annotations, onChange }))

		fireEvent.change(getByTestId(`textAnnotationArea-${0}`), { target: { value: 'zog' } })

		expect(onChange).not.toHaveBeenCalled()

		jest.runAllTimers()

		expect(onChange).toBeCalledTimes(1)
		expect(onChange).toHaveBeenCalledWith([
			{
				value: 'bar',
				text: 'bar_text',
			},
			{ value: 'foo', text: 'zog' },
		])
	})
})
