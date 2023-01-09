import PropTypes from 'prop-types'
import React from 'react'

import projectTypes from 'shared/enums/projectTypes'
import { NER, TEXT, ZONE } from 'shared/enums/annotationTypes'

import { findAnnotationItemType } from 'modules/project/services/annotationServices'

import NerContainer from 'modules/project/components/common/NerContainer'
import TextItemContainer from 'modules/project/components/common/TextItemContainer'
import ImageMarker from 'modules/project/components/common/ImageMarker'

const AnnotationItemWrapper = ({ projectType, tasks, currentItem, options }) => {
  const annotationType = findAnnotationItemType(projectType, tasks)
  const { body, highlights, data } = currentItem

  const filteredTasks = tasks.filter((task) => task.type === annotationType)

  switch (annotationType) {
    case TEXT: {
      return <TextItemContainer content={body} highlights={highlights} />
    }

    case NER: {
      return <NerContainer {...options} content={body} highlights={highlights} tasks={filteredTasks} />
    }

    case ZONE: {
      return <ImageMarker {...options} content={data?.url} tasks={filteredTasks} />
    }
    default: {
      return null
    }
  }
}

export default AnnotationItemWrapper

const getProptypes = (props) => {
  const annotationType = findAnnotationItemType(props.type, props.tasks)

  switch (annotationType) {
    case TEXT:
      return TextItemContainer.propTypes
    case NER:
      return NerContainer.propTypes
    case ZONE:
      return ImageMarker.propTypes
    default:
      return null
  }
}

AnnotationItemWrapper.propTypes = {
  projectType: PropTypes.oneOf(projectTypes).isRequired,
  currentItem: PropTypes.shape({
    body: PropTypes.oneOfType([TextItemContainer.propTypes.content, NerContainer.propTypes.content]),
    highlights: PropTypes.oneOfType([TextItemContainer.propTypes.highlights, NerContainer.propTypes.highlights]),
    data: PropTypes.shape({
      url: ImageMarker.propTypes.content,
    }),
  }),
  tasks: PropTypes.oneOfType([ImageMarker.propTypes.tasks, NerContainer.propTypes.tasks]),
  options: PropTypes.shape(getProptypes),
}
