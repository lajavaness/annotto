import { Checkbox, Form, Radio, Space } from 'antd'
import { isEmpty } from 'lodash'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { useCallback } from 'react'

import { ALLITEMS, ANNOTATIONSANDCOMMENTS, CONFIGURATION, HISTORY } from 'shared/enums/exportTypes'

import { exportConfig } from 'modules/configurationProject/actions/configurationProjectActions'

import * as Styled from 'modules/configurationProject/components/__styles__/ExportStepPage.styles'

const ExportStepPage = () => {
	const dispatch = useDispatch()

	const { t } = useTranslation('configurationProject')

	const checkboxOptions = [
		{ label: t('configurationProject:export.configuration'), value: [CONFIGURATION] },
		{ label: t('configurationProject:export.allItems'), value: [ALLITEMS] },
	]

	const radioOptions = [
		{ label: t('configurationProject:export.annotationsAndCommentsHistory'), value: [ANNOTATIONSANDCOMMENTS, HISTORY] },
		{ label: t('configurationProject:export.annotationsAndComment'), value: [ANNOTATIONSANDCOMMENTS] },
	]

	const _onFinish = useCallback(
		({ checked, selected }) => {
			let options = {}
			let types = []

			if (!isEmpty(checked)) {
				types = checked.reduce((acc, result) => [...result, ...acc], [])
			}

			if (!isEmpty(selected)) {
				types = [...types, ...selected]
			}

			if (!isEmpty(types)) {
				types.forEach((type) => (options = { ...options, [type]: true }))
				dispatch(exportConfig(options))
			}
		},
		[dispatch]
	)

	return (
		<Styled.Root>
			<Styled.Form layout="vertical" onFinish={_onFinish}>
				<Space direction="vertical">
					<Form.Item name="checked">
						<Checkbox.Group>
							<Space direction="vertical">
								{checkboxOptions.map(({ label, value }, index) => (
									<Checkbox key={`${value}_${index}`} value={value}>
										{label}
									</Checkbox>
								))}
							</Space>
						</Checkbox.Group>
					</Form.Item>
					<Form.Item name="selected">
						<Radio.Group>
							<Space direction="vertical">
								{radioOptions.map(({ label, value }, index) => (
									<Radio key={`${value}_${index}`} value={value}>
										{label}
									</Radio>
								))}
							</Space>
						</Radio.Group>
					</Form.Item>
					<Form.Item>
						<Styled.Button type="ghost" htmlType="submit">
							{t('configurationProject:export.exportButton')}
						</Styled.Button>
					</Form.Item>
				</Space>
			</Styled.Form>
		</Styled.Root>
	)
}

export default ExportStepPage
