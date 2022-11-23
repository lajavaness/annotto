import { ThemeProvider } from 'styled-components'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import CheckLabelList from '../CheckLabelList'

const defaultProps = {}
const getInstance = (props) => (
	<ThemeProvider theme={theme}>
		<CheckLabelList {...defaultProps} {...props} />
	</ThemeProvider>
)

describe('CheckLabelList', () => {
	const tasks = [
		{
			value: 'value1.1',
			label: 'label1.1',
			category: 'task1',
			type: 'classifications',
			conditions: [],
			hotkey: 'a',
		},
		{
			value: 'value1.2',
			label: 'label1.2',
			category: 'task1',
			type: 'classifications',
			conditions: [],
		},
		{
			value: 'value2.1',
			label: 'label2.1',
			category: 'task2',
			type: 'classifications',
			conditions: ['value1.2'],
		},
	]

	describe('matches snapshot', () => {
		const data = [
			{ title: 'with no data', props: { tasks: [], annotations: [], onChange: null } },
			{ title: 'with tasks', props: { tasks, annotations: [], onChange: null } },
			{
				title: 'with tasks && annotations',
				props: { tasks: [], annotations: [{ task: 'RA' }], onChange: null },
			},
		]

		data.forEach(({ title, props }) => {
			it(title, () => {
				const { asFragment } = render(getInstance(props))
				expect(asFragment()).toMatchSnapshot()
			})
		})
	})

	it('renders label list', () => {
		const { getByText, getAllByTestId } = render(getInstance({ tasks }))

		expect(getByText('task1')).toBeInTheDocument()
		expect(getAllByTestId('__checkbox__')).toHaveLength(tasks.filter((task) => !task.conditions.length).length)
	})

	it('triggers onChange callback', () => {
		const onChange = jest.fn()
		const annotations = [{ value: 'value1.2' }]
		const { getByText, getAllByTestId, rerender } = render(getInstance({ tasks, onChange, annotations }))

		fireEvent.click(getAllByTestId('__checkbox__')[0])
		expect(onChange).toHaveBeenCalledWith([{ value: 'value1.2' }, { value: 'value1.1' }])

		fireEvent.keyDown(getAllByTestId('__check-label-list__')[0], { key: '1' })
		expect(onChange).toHaveBeenCalledWith([{ value: 'value1.2' }, { value: 'value1.1' }])

		expect(getByText('task2')).toBeInTheDocument()
		rerender(getInstance({ tasks, onChange, annotations: [] }))
		expect(screen.queryByText('task2')).not.toBeInTheDocument()
	})
})
