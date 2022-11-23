import { DatePicker, Form, Input, InputNumber, Radio, Select } from 'antd'
import { isEmpty } from 'lodash'
import React from 'react'

export const renderRadioGroupFormItem = (label, key, formField, radios, name, restProps = {}) => (
	<Form.Item {...formField} name={name || [formField.name, key]} key={key} label={label} {...restProps}>
		<Radio.Group>
			{radios.map(({ value, label }) => (
				<Radio.Button value={value} key={value}>
					{label}
				</Radio.Button>
			))}
		</Radio.Group>
	</Form.Item>
)

export const renderInputNumberFormItem = (label, key, formField, name, restProps = {}, inputProps = {}) => (
	<Form.Item {...formField} name={name || [formField.name, key]} key={key} label={label} {...restProps}>
		<InputNumber placeholder={key} {...inputProps} />
	</Form.Item>
)

export const renderRangePickerFormItem = (label, key, formField, name, restProps = {}) => (
	<Form.Item {...formField} name={name || [formField.name, key]} key={key} label={label} {...restProps}>
		<DatePicker.RangePicker allowClear />
	</Form.Item>
)

export const renderSelectFormItem = (label, key, formField, name, selectProps = {}, restProps = {}) => (
	<Form.Item {...formField} name={name || [formField.name, key]} key={key} label={label} {...restProps}>
		<Select {...selectProps} />
	</Form.Item>
)

export const renderSelectGroupFormItem = (label, key, formField, name, options, selectProps = {}, restProps = {}) => (
	<Form.Item {...formField} name={name || [formField.name, key]} key={key} label={label} {...restProps}>
		{!isEmpty(options) ? (
			<Select {...selectProps}>
				{options.map(({ label, values }, index) => (
					<Select.OptGroup key={`${index}_${label}`} label={label}>
						{!isEmpty(values) &&
							values.map(({ value, label }, i) => (
								<Select.Option key={`${i}_${value}`} value={value}>
									{label}
								</Select.Option>
							))}
					</Select.OptGroup>
				))}
			</Select>
		) : (
			<Select {...selectProps} />
		)}
	</Form.Item>
)

export const renderTextAreaFormItem = (label, key, formField, name, inputProps = {}, restProps = {}) => (
	<Form.Item {...formField} name={name || [formField.name, key]} key={key} label={label} {...restProps}>
		<Input.TextArea placeholder={key} {...inputProps} />
	</Form.Item>
)

export const renderInputFormItem = (label, key, formField, name, inputProps = {}, restProps = {}) => (
	<Form.Item {...formField} name={name || [formField.name, key]} key={key} label={label} {...restProps}>
		<Input placeholder={key} {...inputProps} style={{ width: '100%' }} />
	</Form.Item>
)
