import { Annotation } from '../../../db/models/annotations'
import { Item } from '../../../db/models/items'
import { exportAnnotations } from '../download'
import item from './seeds/item.json'
import annotations from './seeds/annotations.json'

describe('Export', () => {
  test('Classification + Ner with relation Export', () => {
    const output = exportAnnotations(<Item>(<unknown>item), <Annotation[]>(<unknown>annotations))

    const expectedExport = {
      classifications: {
        constraint_type_in_paragraph: {
          labels: [
            {
              value: 'c_n_1',
            },
            {
              value: 'c_base',
            },
            {
              value: 'c_n_1',
            },
            {
              value: 'c_n_1',
            },
          ],
        },
      },
      ner: {
        grid_entities: {
          entities: [
            {
              value: 'ent_voltage',
              start_char: 725,
              end_char: 730,
              ent_id: 0,
            },
            {
              value: 'ent_voltage',
              start_char: 190,
              end_char: 196,
              ent_id: 1,
            },
            {
              value: 'ent_substation',
              start_char: 627,
              end_char: 632,
              ent_id: 2,
            },
            {
              value: 'ent_transmission_line',
              start_char: 800,
              end_char: 813,
              ent_id: 4,
            },
            {
              value: 'ent_substation',
              start_char: 381,
              end_char: 393,
              ent_id: 6,
            },
            {
              value: 'ent_substation',
              start_char: 375,
              end_char: 380,
              ent_id: 7,
            },
            {
              value: 'ent_substation',
              start_char: 510,
              end_char: 519,
              ent_id: 9,
            },
            {
              value: 'ent_substation',
              start_char: 504,
              end_char: 509,
              ent_id: 10,
            },
            {
              value: 'ent_substation',
              start_char: 457,
              end_char: 469,
              ent_id: 12,
            },
            {
              value: 'ent_substation',
              start_char: 633,
              end_char: 645,
              ent_id: 13,
            },
            {
              value: 'ent_substation',
              start_char: 577,
              end_char: 587,
              ent_id: 15,
            },
            {
              value: 'ent_substation',
              start_char: 177,
              end_char: 189,
              ent_id: 16,
            },
          ],
        },
        constraints_entities: {
          entities: [
            {
              value: 'ent_c_n_1',
              start_char: 218,
              end_char: 232,
              ent_id: 3,
            },
            {
              value: 'ent_c_n_1',
              start_char: 654,
              end_char: 668,
              ent_id: 5,
            },
            {
              value: 'ent_c_n_1',
              start_char: 317,
              end_char: 331,
              ent_id: 8,
            },
            {
              value: 'ent_c_base',
              start_char: 527,
              end_char: 537,
              ent_id: 11,
            },
            {
              value: 'ent_c_n_1',
              start_char: 753,
              end_char: 767,
              ent_id: 14,
            },
          ],
        },
        relations: [
          {
            label: 'is_line_extremity',
            src: 7,
            dest: 6,
          },
          {
            label: 'is_line_extremity',
            src: 10,
            dest: 9,
          },
          {
            label: 'is_constraint_of',
            dest: 4,
            src: 14,
          },
          {
            label: 'is_line_extremity',
            src: 2,
            dest: 13,
          },
          {
            label: 'is_constraint_of',
            dest: 2,
            src: 5,
          },
          {
            label: 'is_constraint_of',
            dest: 13,
            src: 5,
          },
          {
            label: 'is_constraint_of',
            dest: 7,
            src: 8,
          },
          {
            label: 'is_constraint_of',
            dest: 6,
            src: 8,
          },
          {
            label: 'is_constraint_of',
            dest: 9,
            src: 11,
          },
          {
            label: 'is_constraint_of',
            dest: 10,
            src: 11,
          },
          {
            label: 'is_tension_of',
            src: 1,
            dest: 16,
          },
        ],
      },
    }

    expect(output.annotation).toEqual(expectedExport)
  })
})
