import {
	ArrowLeftOutlined,
	DownOutlined,
	ExclamationCircleOutlined,
	PoweroffOutlined,
	UserOutlined,
} from '@ant-design/icons'
import { Dropdown, Menu, Modal, Skeleton } from 'antd'
import { Link, navigate, useLocation } from '@reach/router'
import { match } from '@reach/router/lib/utils'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { selectConfigProjectName } from 'modules/configurationProject/selectors/configurationProjectSelectors'
import { selectProjectId, selectProjectName } from 'modules/project/selectors/projectSelectors'

import { logout } from 'modules/root/actions/rootActions'

import Loader from 'shared/components/loader/Loader'

import * as Styled from './__styles__/Main.styles'

const Main = ({ user, headerActions, setHeaderActions, children }) => {
	const [backNavigation, setBackNavigation] = useState(null)
	const [title, setTitle] = useState(null)

	const projectName = useSelector(selectProjectName)
	const projectId = useSelector(selectProjectId)
	const projectConfigName = useSelector(selectConfigProjectName)

	const dispatch = useDispatch()

	const location = useLocation()

	const { t } = useTranslation('root')

	useEffect(() => {
		switch (true) {
			case !!match('/', location.pathname): {
				setBackNavigation(null)
				setTitle(t(`root:header.title.home`))
				break
			}
			case !!match('/create_project/*', location.pathname): {
				setBackNavigation({ label: t(`root:header.title.home`), path: '/' })
				setTitle(t(`root:header.title.createProject`))
				break
			}
			case !!match('/edit_project/:projectId/*', location.pathname): {
				const projectConfigId = match('/edit_project/:projectId/*', location.pathname).params.projectId
				setBackNavigation({ label: projectConfigName, path: `/project/${projectConfigId}` })
				setTitle(t(`root:header.title.editProject`))
				break
			}
			case !!match('/project/:projectId', location.pathname): {
				setBackNavigation({ label: t(`root:header.title.home`), path: '/' })
				setTitle(projectName)
				break
			}

			case !!match('/project/:projectId/annotation/*itemId', location.pathname): {
				setBackNavigation({ label: projectName, path: `/project/${projectId}` })
				setTitle(t(`root:header.title.annotation`))
				break
			}
			default: {
				setHeaderActions(null)
				setBackNavigation(null)
				setTitle(t('root:errors.label.default'))
			}
		}
	}, [location, projectName, projectConfigName, projectId, t, setHeaderActions])

	const _onLogoutClick = useCallback(
		() =>
			Modal.confirm({
				icon: <ExclamationCircleOutlined />,
				title: t(`root:logoutConfirmModal.title`),
				content: t(`root:logoutConfirmModal.content`),
				okText: t(`root:logoutConfirmModal.ok`),
				cancelText: t(`root:logoutConfirmModal.cancel`),
				onOk() {
					dispatch(logout())
				},
			}),
		[t, dispatch]
	)

	const resolvedMenu = (
		<Menu>
			<Styled.MenuItem key="0">
				<Styled.MenuItemButton type="text" icon={<PoweroffOutlined />} onClick={_onLogoutClick}>
					{t(`root:header.menu.logout`)}
				</Styled.MenuItemButton>
			</Styled.MenuItem>
		</Menu>
	)

	const _onBackButtonClick = (path) => () => navigate(path)

	return (
		<Styled.Root>
			<Styled.Header>
				<Styled.NavigationContainer>
					<Link to="/">
						<Styled.LogoContainer>
							<Styled.Border />
							<Styled.LogoContent>
								<Styled.Logo src={`${process.env.PUBLIC_URL}/static/images/logo.svg`} alt="logo" />
							</Styled.LogoContent>
						</Styled.LogoContainer>
					</Link>
					<Styled.NavigationContent>
						{backNavigation ? (
							<Styled.BackButton
								icon={<ArrowLeftOutlined />}
								type="link"
								onClick={_onBackButtonClick(backNavigation.path)}
							>
								{backNavigation.label}
							</Styled.BackButton>
						) : (
							<Styled.BreadCrumb>{t(`root:header.title.default`)}</Styled.BreadCrumb>
						)}
						{title ? (
							<Styled.Title>{title}</Styled.Title>
						) : (
							<Skeleton.Input style={{ width: 150 }} active size={'small'} />
						)}
					</Styled.NavigationContent>
				</Styled.NavigationContainer>
				<Styled.ActionContainer>
					{headerActions}
					<Styled.Divider type={'vertical'} />
					<Dropdown overlay={resolvedMenu} trigger={['click']}>
						<Styled.UserButton type="link" icon={<DownOutlined />} size={'large'}>
							{user?.firstName && user?.lastName ? (
								`${user.firstName} ${user.lastName.substring(0, 1)}.`
							) : (
								<UserOutlined />
							)}
						</Styled.UserButton>
					</Dropdown>
				</Styled.ActionContainer>
			</Styled.Header>
			<Styled.Content>
				<Suspense path="/" fallback={<Loader />}>
					{children}
				</Suspense>
			</Styled.Content>
		</Styled.Root>
	)
}

Main.propTypes = {
	user: PropTypes.shape({
		/** Defines the firstName of the user to display in the header bar. */
		firstName: PropTypes.string,
		/** Defines the lastName of the user to display in the header bar. */
		lastName: PropTypes.string,
	}),
	/** Defines the content of actions. */
	headerActions: PropTypes.node,
	/** Defines the handler called to set the content of actions. */
	setHeaderActions: PropTypes.func,
	/** Content of main. */
	children: PropTypes.node,
}

Main.defaultProps = {
	user: null,
	setHeaderActions: null,
	children: null,
	headerActions: null,
}

export default Main
