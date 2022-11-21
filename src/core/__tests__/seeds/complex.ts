import mongoose from 'mongoose'

const idRA = new mongoose.Types.ObjectId()
const idRB = new mongoose.Types.ObjectId()
const idRA01 = new mongoose.Types.ObjectId()
const idBAR = new mongoose.Types.ObjectId()
const idFOO = new mongoose.Types.ObjectId()
const idAggressive = new mongoose.Types.ObjectId()
const idNer1 = new mongoose.Types.ObjectId()
const idZone1 = new mongoose.Types.ObjectId()

export default [
  {
    type: 'classifications',
    _id: idRA,
    value: 'RA',
    hotkey: 'A',
    label: 'Category RA',
    category: 'level1',
    updatedAt: '2020-08-25T14:52:22.157Z',
    createdAt: '2020-08-25T14:52:22.157Z',
    __v: 0,
  },
  {
    condition: ['FOO'],
    type: 'classifications',
    _id: idBAR,
    value: 'BAR',
    hotkey: 'X',
    label: 'BAR',
    category: 'level1',
    updatedAt: '2020-08-25T14:52:22.160Z',
    createdAt: '2020-08-25T14:52:22.160Z',
    __v: 0,
  },
  {
    conditions: ['Category RA', 'Category RB'],
    type: 'classifications',
    _id: idFOO,
    value: 'FOO',
    hotkey: 'Z',
    label: 'FOO',
    category: 'level1',
    updatedAt: '2020-08-25T14:52:22.159Z',
    createdAt: '2020-08-25T14:52:22.159Z',
    __v: 0,
  },
  {
    conditions: ['Category RA'],
    type: 'classifications',
    _id: idRA01,
    value: 'RA01',
    hotkey: 'B',
    label: 'Category RA01',
    category: 'level1',
    updatedAt: '2020-08-25T14:52:22.161Z',
    createdAt: '2020-08-25T14:52:22.161Z',
    __v: 0,
  },
  {
    type: 'classifications',
    _id: idRB,
    value: 'RB',
    hotkey: 'C',
    label: 'Category RB',
    category: 'level1',
    updatedAt: '2020-08-25T14:52:22.161Z',
    createdAt: '2020-08-25T14:52:22.161Z',
    __v: 0,
  },
  {
    type: 'classifications',
    _id: idAggressive,
    value: 'Aggressive',
    hotkey: 'D',
    label: 'agg',
    category: 'Tone',
    updatedAt: '2020-08-25T14:52:22.161Z',
    createdAt: '2020-08-25T14:52:22.161Z',
    __v: 0,
  },
  {
    type: 'ner',
    _id: idNer1,
    value: 'NER1',
    hotkey: 'E',
    label: 'Category NER1',
    category: 'NER-level1',
    updatedAt: '2020-08-25T14:52:22.163Z',
    createdAt: '2020-08-25T14:52:22.163Z',
    __v: 0,
  },
  {
    type: 'zone',
    _id: idZone1,
    value: 'ZONE1',
    hotkey: 'F',
    label: 'Category ZONE1',
    category: 'zone-level1',
    updatedAt: '2020-08-25T14:52:22.163Z',
    createdAt: '2020-08-25T14:52:22.163Z',
    __v: 0,
  },
]
