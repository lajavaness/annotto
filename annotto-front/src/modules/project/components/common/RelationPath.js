import CloseOutlined from '@ant-design/icons/lib/icons/CloseOutlined'
import PropTypes from 'prop-types'
import { useEffect, useMemo, useRef, useState } from 'react'

import * as Styled from 'modules/project/components/common/__styles__/RelationPath.styles'

const MAX_VALUE_CHAR = 15
const PADDING_LABEL = 5
const ICON_SIZE = 16
const ARROW_SIZE = 3

const RelationPath = ({
  relationIndex,
  color,
  srcProperties,
  destProperties,
  parentContainerProperties,
  value,
  isSelected,
  onClick,
  onDeleteClick,
}) => {
  const rootRef = useRef(null)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 50, height: 16 })
  const [isHovered, setIsHovered] = useState(false)

  const resolveRelationPosition = useMemo(() => {
    if (srcProperties && destProperties && parentContainerProperties) {
      let x1 = srcProperties.x - parentContainerProperties.x
      let y1 = srcProperties.y - parentContainerProperties.y
      let x2 = destProperties.x - parentContainerProperties.x
      let y2 = destProperties.y - parentContainerProperties.y

      if (y1 === y2) {
        x1 += srcProperties.width / 2
        y1 = y1 + srcProperties.height + ARROW_SIZE

        x2 += destProperties.width / 2
        y2 = y2 + destProperties.height + ARROW_SIZE

        return `M ${x1} ${y1} L ${x1} ${y1 + ARROW_SIZE * 5} L ${x2} ${y2 + ARROW_SIZE * 5} L ${x2} ${y2}`
      }

      if (y1 < y2) {
        x1 += srcProperties.width / 2
        y1 = y1 + srcProperties.height + ARROW_SIZE
        x2 = x2 + destProperties.width / 2 - ARROW_SIZE
        y2 -= ARROW_SIZE
      }

      if (y1 > y2) {
        x1 += srcProperties.width / 2
        y1 -= ARROW_SIZE
        x2 = x2 + destProperties.width / 2 - ARROW_SIZE
        y2 = y2 + destProperties.height + ARROW_SIZE
      }

      // mid-point of line:
      const mpx = (x2 + x1) * 0.5
      const mpy = (y2 + y1) * 0.5

      // angle of perpendicular to line:
      const theta = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2

      // distance of control point from mid-point of line
      // define the curvature of the curve
      const offset = x2 > x1 ? (x2 - x1) / 15 : (x1 - x2) / 15

      // location of control point:
      const c1x = mpx + offset * Math.cos(theta)
      const c1y = mpy + offset * Math.sin(theta)

      return `M${x1} ${y1} Q${c1x} ${c1y} ${x2} ${y2}`
    }
    return undefined
  }, [parentContainerProperties, srcProperties, destProperties])

  const _onMouseOver = () => setIsHovered(true)

  const _onMouseLeave = () => setIsHovered(false)

  useEffect(() => {
    if (rootRef.current?.firstChild && resolveRelationPosition) {
      const path = rootRef.current.childNodes[1]
      const label = rootRef.current.childNodes[2].lastChild

      const isCurve = path.getAttribute('d').includes('Q')

      const { x, y } = path.getPointAtLength(isCurve ? path.getTotalLength() * 0.2 : path.getTotalLength() * 0.5)

      const { width, height } = label.getBoundingClientRect()

      setPosition({ x: x - width / 2, y: y - height / 2 })
      setSize({ width: width + PADDING_LABEL * 2, height: height + PADDING_LABEL * 2 })
    }
  }, [rootRef, resolveRelationPosition])

  return (
    <Styled.Root
      ref={rootRef}
      stroke={color}
      fill="transparent"
      onMouseOver={_onMouseOver}
      onMouseLeave={_onMouseLeave}
      isSelected={isSelected}
    >
      <defs onClick={onClick}>
        <Styled.Marker
          id={`arrowhead_${relationIndex}`}
          markerWidth={ARROW_SIZE}
          markerHeight={ARROW_SIZE}
          refX={ARROW_SIZE / 1.5}
          refY={ARROW_SIZE / 2}
          orient="auto"
          stroke="none"
        >
          <polygon points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`} />
        </Styled.Marker>
      </defs>
      <path
        id={`curve_${relationIndex}`}
        d={resolveRelationPosition}
        strokeWidth="3"
        strokeLinecap="round"
        markerEnd={`url(#arrowhead_${relationIndex})`}
        onClick={onClick}
      />
      <g visibility={position?.x && position?.y ? 'visible' : 'hidden'}>
        <rect
          x={position?.x}
          y={position?.y}
          width={size.width}
          height={size.height}
          rx="5"
          ry="5"
          stroke="none"
          fill={color}
          onClick={onClick}
        />
        {isHovered && (
          <foreignObject
            x={position?.x ? position.x + size.width - ICON_SIZE / 2 : 0}
            y={position?.y ? position.y - ICON_SIZE / 2 : 0}
            width={ICON_SIZE}
            height={ICON_SIZE}
          >
            <Styled.RemoveButton onClick={onDeleteClick} icon={<CloseOutlined />} type="primary" shape="circle" />
          </foreignObject>
        )}
        <Styled.Text
          x={position?.x ? position.x + size.width / 2 : 0}
          y={position?.y ? position.y + size.height / 2 : 0}
          dominantBaseline="middle"
          textAnchor="middle"
          onClick={onClick}
        >
          {value && value.length > MAX_VALUE_CHAR ? `${value.substring(0, MAX_VALUE_CHAR)}...` : value}
        </Styled.Text>
      </g>
    </Styled.Root>
  )
}

export default RelationPath

const NodeProperties = PropTypes.shape({
  /** Used like the position of the container on y,.
   * Used to define the offset to be subtracted to the position of the relation. */
  x: PropTypes.number.isRequired,
  /** Used like the position of the container on y,.
   * Allows to define the shift to be subtracted to the position of the relation. */
  y: PropTypes.number.isRequired,
  /** Used to get the width of the annotation, to center the beginning or the end of the path on an annotation. */
  width: PropTypes.number.isRequired,
  /** Used to get the height of the annotation, to place the start or end of the path above or below an annotation. */
  height: PropTypes.number.isRequired,
})

RelationPath.propTypes = {
  /** Defines index of this relation. This index must be uniq because it's used to link the arrowhead to the path. */
  relationIndex: PropTypes.number.isRequired,
  /** Defines the color of the relation to manage the stroke color and the background color of the label. */
  color: PropTypes.string,
  /** Defines the node properties of the source of the relation.
   * Used to define the starting point of the path. */
  srcProperties: NodeProperties,
  /** Defines the node properties of the destination of the relation.
   * Used to define the ending point of the path.  */
  destProperties: NodeProperties,
  /** Defines the node properties of the parent container of the relation.  */
  parentContainerProperties: NodeProperties,
  /** Defines the value of the relation. */
  value: PropTypes.string,
  /** Defines the handler called when the relation  is clicked. */
  onClick: PropTypes.func,
  /** Defines the handler called when the delete button is clicked. */
  onDeleteClick: PropTypes.func,
  /** Defines is the relation is selected, if true a background color is applied . */
  isSelected: PropTypes.bool,
}

RelationPath.defaultProps = {
  relationIndex: 0,
  color: null,
  isSelected: false,
  srcProperties: null,
  destProperties: null,
  parentContainerProperties: null,
  value: null,
  onClick: null,
  onDeleteClick: null,
}
