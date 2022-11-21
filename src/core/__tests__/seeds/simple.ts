import mongoose from 'mongoose'

const idRA = new mongoose.Types.ObjectId()
const idRB = new mongoose.Types.ObjectId()
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
