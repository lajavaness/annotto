import { isEmpty } from 'lodash'
import { useMemo } from 'react'

import { isZoneAnnotationEquivalent } from 'shared/utils/annotationUtils'

import theme from '__theme__'

const useResolvedAnnotationsAndPredictions = (annotations, predictions, showPredictions, tasks) => {
  const filterEmptyZoneAndInsertTask = (data) =>
    data
      .filter(({ zone }) => !!zone)
      .map((item) => {
        const task = tasks.find((t) => t.value === item.value)
        if (task && !task?.color) {
          task.color = theme.colors.defaultAnnotationColors[tasks.indexOf(task)]
        }
        return { task, ...item }
      })

  const resolvedAnnotations = useMemo(
    () => (!isEmpty(annotations) ? filterEmptyZoneAndInsertTask(annotations) : []),
    [annotations]
  )

  const resolvedPredictions = useMemo(
    () => (!isEmpty(predictions) ? filterEmptyZoneAndInsertTask(predictions) : []),
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
