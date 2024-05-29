import { Button, Result } from 'antd'
import PropTypes from 'prop-types'
import { Component } from 'react'

class ErrorBoundary extends Component {
  state = {
    error: null,
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidCatch(error, info) {
    console.error('Crash:', error, info)
  }

  render() {
    const { children } = this.props
    const { error } = this.state

    if (error) {
      return (
        <Result
          default
          status="500"
          title="500"
          subTitle="Sorry, something went wrong."
          extra={
            <Button type="link" href="/">
              Back Home
            </Button>
          }
        />
      )
    }

    return children
  }
}

ErrorBoundary.propTypes = {
  /** Content to display if there are no errors. */
  children: PropTypes.node,
}

ErrorBoundary.defaultProps = {
  children: null,
}

export default ErrorBoundary
