import PropTypes from 'prop-types'
import { Rect } from 'react-konva'

const AnchorPoint = ({
  isMouseOverStartPoint,
  scale,
  point,
  color,
  imageWidth,
  imageHeight,
  onDragMove,
  onDragEnd,
  onMouseOver,
}) => {
  const width = isMouseOverStartPoint ? 12 / scale : 6 / scale
  const x = point.x * imageWidth - width / 2
  const y = point.y * imageHeight - width / 2

  return (
    <Rect
      name="anchorPoint"
      draggable={onDragMove && onDragEnd}
      fill="white"
      x={x}
      y={y}
      width={width}
      height={width}
      stroke={color}
      strokeWidth={3}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onMouseOver={onMouseOver}
    />
  )
}

export default AnchorPoint

AnchorPoint.propTypes = {
  isMouseOverStartPoint: PropTypes.bool,
  scale: PropTypes.number,
  imageWidth: PropTypes.number,
  imageHeight: PropTypes.number,
  color: PropTypes.string,
  point: PropTypes.shape({
    /** The coordinate of a point on the x-axis. */
    x: PropTypes.number.isRequired,
    /** The coordinate of a point on the y-axis. */
    y: PropTypes.number.isRequired,
  }),
  onDragMove: PropTypes.func,
  onDragEnd: PropTypes.func,
  onMouseOver: PropTypes.func,
}
