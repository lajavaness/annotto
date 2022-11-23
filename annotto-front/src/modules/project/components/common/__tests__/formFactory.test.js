import { Form } from 'antd'
import { render } from '@testing-library/react'
import React from 'react'

import {
	renderInputFormItem,
	renderInputNumberFormItem,
	renderRadioGroupFormItem,
	renderRangePickerFormItem,
	renderSelectFormItem,
	renderSelectGroupFormItem,
	renderTextAreaFormItem,
} from 'modules/project/components/common/formFactory'

describe('formFactory.js', () => {
	const label = 'foo'
	const key = 'bar'
	const formField = { name: 'foo' }
	const radios = [{ value: 'foo', label: 'label' }]
	const name = 'foo'
	const restProps = {}
	const inputProps = {}
	const selectProps = {}
	const options = [{ label: 'foo', values: [{ label: 'bar', value: 'bar' }] }, { label: 'bar' }]

	describe('renderRadioGroupFormItem', () => {
		it('matches snapshot with name', () => {
			const { asFragment } = render(
				<Form>{renderRadioGroupFormItem(label, key, formField, radios, name, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without name', () => {
			const { asFragment } = render(
				<Form>{renderRadioGroupFormItem(label, key, formField, radios, null, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without restProps', () => {
			const { asFragment } = render(<Form>{renderRadioGroupFormItem(label, key, formField, radios, name)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})
	})

	describe('renderInputNumberFormItem', () => {
		it('matches snapshot with name', () => {
			const { asFragment } = render(
				<Form>{renderInputNumberFormItem(label, key, formField, name, restProps, inputProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without name', () => {
			const { asFragment } = render(
				<Form>{renderInputNumberFormItem(label, key, formField, null, restProps, inputProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without inputProps', () => {
			const { asFragment } = render(<Form>{renderInputNumberFormItem(label, key, formField, name, restProps)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without restProps', () => {
			const { asFragment } = render(<Form>{renderInputNumberFormItem(label, key, formField, name)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})
	})

	describe('renderRangePickerFormItem', () => {
		it('matches snapshot with name', () => {
			const { asFragment } = render(<Form>{renderRangePickerFormItem(label, key, formField, name, restProps)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without name', () => {
			const { asFragment } = render(<Form>{renderRangePickerFormItem(label, key, formField, null, restProps)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without restProps', () => {
			const { asFragment } = render(<Form>{renderRangePickerFormItem(label, key, formField, name)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})
	})

	describe('renderSelectFormItem', () => {
		it('matches snapshot with name', () => {
			const { asFragment } = render(
				<Form>{renderSelectFormItem(label, key, formField, name, selectProps, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without name', () => {
			const { asFragment } = render(
				<Form>{renderSelectFormItem(label, key, formField, null, selectProps, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without restProps', () => {
			const { asFragment } = render(<Form>{renderSelectFormItem(label, key, formField, name, selectProps)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot with restProps and selectProps', () => {
			const { asFragment } = render(<Form>{renderSelectFormItem(label, key, formField, name)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})
	})

	describe('renderSelectGroupFormItem', () => {
		it('matches snapshot with name', () => {
			const { asFragment } = render(
				<Form>{renderSelectGroupFormItem(label, key, formField, name, options, selectProps, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without name', () => {
			const { asFragment } = render(
				<Form>{renderSelectGroupFormItem(label, key, formField, null, options, selectProps, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot with empty options', () => {
			const { asFragment } = render(
				<Form>{renderSelectGroupFormItem(label, key, formField, name, [], selectProps, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without restProps', () => {
			const { asFragment } = render(
				<Form>{renderSelectGroupFormItem(label, key, formField, name, options, selectProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without selectProps', () => {
			const { asFragment } = render(<Form>{renderSelectGroupFormItem(label, key, formField, name, options)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})
	})

	describe('renderTextAreaFormItem', () => {
		it('matches snapshot with name', () => {
			const { asFragment } = render(
				<Form>{renderTextAreaFormItem(label, key, formField, name, inputProps, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without name', () => {
			const { asFragment } = render(
				<Form>{renderTextAreaFormItem(label, key, formField, null, inputProps, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without restProps', () => {
			const { asFragment } = render(<Form>{renderTextAreaFormItem(label, key, formField, name, inputProps)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without inputProps', () => {
			const { asFragment } = render(<Form>{renderTextAreaFormItem(label, key, formField, name)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})
	})

	describe('renderInputFormItem', () => {
		it('matches snapshot with name', () => {
			const { asFragment } = render(
				<Form>{renderInputFormItem(label, key, formField, name, inputProps, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without name', () => {
			const { asFragment } = render(
				<Form>{renderInputFormItem(label, key, formField, null, inputProps, restProps)}</Form>
			)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without restProps', () => {
			const { asFragment } = render(<Form>{renderInputFormItem(label, key, formField, name, inputProps)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})

		it('matches snapshot without inputProps', () => {
			const { asFragment } = render(<Form>{renderInputFormItem(label, key, formField, name)}</Form>)
			expect(asFragment()).toMatchSnapshot()
		})
	})
})
