import { isEmpty } from 'lodash'
import { useMemo } from 'react'

import { isZoneAnnotationEquivalent } from 'shared/utils/annotationUtils'

const useResolvedAnnotationsAndPredictions = (annotations, predictions, showPredictions) => {
  const resolvedAnnotations = useMemo(
    () => (!isEmpty(annotations) ? annotations.filter(({ zone }) => !!zone) : []),
    [annotations]
  )

  const resolvedPredictions = useMemo(
    () => (!isEmpty(predictions) ? predictions.filter(({ zone }) => !!zone) : []),
    [predictions]
  )

  const resolvedAnnotationsAndPredictions = useMemo(() => {
    const resolvePredictionIndex = (predictionToFind) =>
      resolvedPredictions.findIndex((prediction) => isZoneAnnotationEquivalent(prediction, predictionToFind))

    const updatedAnnotations = resolvedAnnotations.map((annotation, annotationIndex) => {
      const predictionIndex = resolvePredictionIndex(annotation)

      return {
        ...annotation,
        annotationIndex,
        predictionIndex: predictionIndex >= 0 ? predictionIndex : null,
      }
    })

    const updatedPredictions = showPredictions
      ? resolvedPredictions
          .filter(
            (prediction) =>
              !resolvedAnnotations.some((annotation) => isZoneAnnotationEquivalent(prediction, annotation))
          )
          .map((prediction) => ({
            ...prediction,
            predictionIndex: resolvePredictionIndex(prediction),
          }))
      : []

    return [...updatedAnnotations, ...updatedPredictions]
  }, [showPredictions, resolvedAnnotations, resolvedPredictions])

  return resolvedAnnotationsAndPredictions
}

export default useResolvedAnnotationsAndPredictions
