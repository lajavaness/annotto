/* eslint-disable @typescript-eslint/no-loss-of-precision */
import mongoose from 'mongoose'
import { InternalEntity } from '../../types'
import { Annotation } from '../../db/models/annotations'
import mongoSetupTeardown from './mongoSetupTeardown'
import {
  changeAnnotationsStatus,
  isZoneAnnotationToCancel,
  isNerAnnotationToCancel,
  isClassificationAnnotationToCancel,
} from '../annotations'

const zoneID = new mongoose.Types.ObjectId()
const zonePayload = <Annotation>(<unknown>{
  value: 'bbox_name',
  zone: [
    { x: 0.17368421052631576, y: 0.11869918699186992 },
    { x: 0.8621052631578947, y: 0.11869918699186992 },
    { x: 0.8621052631578947, y: 0.022764227642276424 },
    { x: 0.47368421052631576, y: 0.022764227642276424 },
  ],
  task: {
    _id: zoneID,
  },
})
const zoneChangeCoordinates = <InternalEntity>(<unknown>{
  value: 'bbox_name',
  zone: [
    { x: 0.27368421052631576, y: 0.31869918699186992 },
    { x: 0.9621052631578947, y: 0.21869918699186992 },
    { x: 0.9621052631578947, y: 0.122764227642276424 },
    { x: 0.57368421052631576, y: 0.022764227642276424 },
  ],
  task: {
    _id: zoneID,
  },
})
const zoneChangeID = <InternalEntity>(<unknown>{
  value: 'bbox_name',
  zone: [
    { x: 0.17368421052631576, y: 0.11869918699186992 },
    { x: 0.8621052631578947, y: 0.11869918699186992 },
    { x: 0.8621052631578947, y: 0.022764227642276424 },
    { x: 0.47368421052631576, y: 0.022764227642276424 },
  ],
  task: {
    _id: new mongoose.Types.ObjectId(),
  },
})

const nerID = new mongoose.Types.ObjectId()
const ner = <Annotation>(<unknown>{
  value: 'name',
  ner: { start: 0, end: 10 },
  task: {
    _id: nerID,
  },
})
const nerChangeChars = <InternalEntity>(<unknown>{
  value: 'name',
  ner: { start: 10, end: 20 },
  task: {
    _id: nerID,
  },
})
const nerChangeID = <InternalEntity>(<unknown>{
  value: 'name',
  ner: { start: 0, end: 10 },
  task: {
    _id: new mongoose.Types.ObjectId(),
  },
})

const classifID = new mongoose.Types.ObjectId()
const task = <Annotation>(<unknown>{
  value: 'formation',
  task: {
    _id: classifID,
  },
})
const classificationChangeID = <InternalEntity>(<unknown>{
  value: 'formation',
  task: {
    _id: new mongoose.Types.ObjectId(),
  },
})

mongoSetupTeardown()

describe('Annotation payload comparison', () => {
  test('Classification annotation with different ObjectID', () => {
    expect(isClassificationAnnotationToCancel(task, [classificationChangeID])).toBe(true)
  })
  test('Zone annotation with different coordinates or ObjectID', () => {
    expect(isZoneAnnotationToCancel(zonePayload, [zoneChangeCoordinates])).toBe(true)
    expect(isZoneAnnotationToCancel(zonePayload, [zoneChangeID])).toBe(true)
  })
  test('Ner annotation with different character position or ObjectID', () => {
    expect(isNerAnnotationToCancel(ner, [nerChangeChars])).toBe(true)
    expect(isNerAnnotationToCancel(ner, [nerChangeID])).toBe(true)
  })
})

describe('annotation statics', () => {
  const payload = <Annotation[]>(<unknown[]>[
    {
      _id: new mongoose.Types.ObjectId(),
      status: 'done',
      tags: <[]>[],
    },
    {
      task: new mongoose.Types.ObjectId(),
      status: 'done',
      tags: <[]>[],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      status: 'cancelled',
      tags: <[]>[],
    },
    {
      task: new mongoose.Types.ObjectId(),
      status: 'cancelled',
      tags: <[]>[],
    },
    {
      task: new mongoose.Types.ObjectId(),
      status: 'done',
      tags: <[]>[],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      status: 'done',
      tags: <[]>[],
    },
  ])

  test('changeAnnotationStatus default to cancelled', () => {
    changeAnnotationsStatus(payload)
    payload.forEach((annotation) => expect(annotation.status).toBe('cancelled'))
  })

  test('ChangeAnnotationStatus status in param', () => {
    const status = 'draft'
    changeAnnotationsStatus(payload, status)
    payload.forEach((annotation) => expect(annotation.status).toBe(status))
  })
})
