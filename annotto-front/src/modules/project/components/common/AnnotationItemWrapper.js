import PropTypes from 'prop-types'
import React from 'react'

import projectType from 'shared/enums/projectType'
import { NER, TEXT, ZONE } from 'shared/enums/annotationTypes'

import { findAnnotationItemType } from 'modules/project/services/annotationServices'

import NerContainer from 'modules/project/components/common/NerContainer'
import TextItemContainer from 'modules/project/components/common/TextItemContainer'
import ImageMarker from 'modules/project/components/common/ImageMarker'

const AnnotationItemWrapper = ({ projectType, tasks, currentItem, options }) => {
  const annotationType = findAnnotationItemType(projectType, tasks)
  const { body, highlights, data } = currentItem

  switch (annotationType) {
    case TEXT: {
      return <TextItemContainer content={body} highlights={highlights} />
    }

    case NER: {
      const filteredTasks = tasks.filter((task) => task.type === NER)
      return <NerContainer content={body} {...options} highlights={highlights} tasks={filteredTasks} />
    }

    case ZONE: {
      const src = data?.url
      const filteredTasks = tasks.filter((task) => task.type === ZONE)
      return <ImageMarker src={src} tasks={filteredTasks} {...options} />
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
    default:
      return ImageMarker.propTypes
  }
}

AnnotationItemWrapper.propTypes = {
  projectType: PropTypes.oneOf(projectType).isRequired,
  currentItem: PropTypes.shape({
    body: PropTypes.oneOfType([TextItemContainer.propTypes.content, NerContainer.propTypes.content]),
    highlights: PropTypes.oneOfType([TextItemContainer.propTypes.highlights, NerContainer.propTypes.highlights]),
    data: PropTypes.shape({
      url: ImageMarker.propTypes.src,
    }),
  }),
  tasks: PropTypes.oneOfType([ImageMarker.propTypes.tasks, NerContainer.propTypes.tasks]),
  options: PropTypes.shape(getProptypes),
}
