import PropTypes from 'prop-types'

import projectTypes from 'shared/enums/projectTypes'
import { AUDIO, HTML, NER, TEXT, VIDEO, ZONE } from 'shared/enums/annotationTypes'

import { findAnnotationItemType } from 'modules/project/services/annotationServices'

import NerContainer from 'modules/project/components/common/NerContainer'
import TextItemContainer from 'modules/project/components/common/TextItemContainer'
import ImageMarker from 'modules/project/components/common/ImageMarker'
import VideoItem from 'modules/project/components/common/VideoItem'
import AudioItem from 'modules/project/components/common/AudioItem'
import HtmlItem from 'modules/project/components/common/HtmlItem'
import ImageContainer from 'modules/project/components/common/image/ImageContainer'

const AnnotationItemWrapper = ({ projectType, tasks, currentItem, options }) => {
  const annotationType = findAnnotationItemType(projectType, tasks)
  const { body, highlights, data } = currentItem

  const filteredTasks = tasks.filter((task) => task.type === annotationType)

  switch (annotationType) {
    case TEXT: {
      return <TextItemContainer content={body} highlights={highlights} />
    }

    case VIDEO: {
      return <VideoItem content={data?.url} />
    }

    case AUDIO: {
      return <AudioItem content={data?.url} />
    }

    case NER: {
      return <NerContainer {...options} content={body} highlights={highlights} tasks={filteredTasks} />
    }

    case ZONE: {
      console.log(options.mode === '2points', data?.url, data?.url)
      return options.mode === '2points' ? (
        <ImageContainer {...options} content={data?.url} tasks={filteredTasks} />
      ) : (
        <ImageMarker {...options} content={data?.url} tasks={filteredTasks} />
      )
    }

    case HTML: {
      return <HtmlItem content={data?.html} />
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
    case VIDEO:
      return VideoItem.propTypes
    case AUDIO:
      return AudioItem.propTypes
    case HTML:
      return HtmlItem.propTypes
    default:
      return null
  }
}

AnnotationItemWrapper.propTypes = {
  projectType: PropTypes.oneOf(projectTypes).isRequired,
  currentItem: PropTypes.shape({
    body: PropTypes.oneOfType([
      TextItemContainer.propTypes.content,
      NerContainer.propTypes.content,
      HtmlItem.propTypes.content,
    ]),
    highlights: PropTypes.oneOfType([TextItemContainer.propTypes.highlights, NerContainer.propTypes.highlights]),
    data: PropTypes.shape({
      url: PropTypes.oneOfType([
        ImageMarker.propTypes.content,
        VideoItem.propTypes.content,
        AudioItem.propTypes.content,
      ]),
      html: HtmlItem.propTypes.content,
    }),
  }),
  tasks: PropTypes.oneOfType([ImageMarker.propTypes.tasks, NerContainer.propTypes.tasks]),
  options: PropTypes.shape(getProptypes),
}
