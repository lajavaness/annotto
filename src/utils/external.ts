import fetch from 'node-fetch'

export interface IGetSimilarityUuids {
  (endpoint: string, value: string, neg_values: string[], limit?: number): Promise<(string | number)[]>
}

/**
 * Get similarity uuids.
 * @param {string} url Similarity endpoint.
 * @param {string} text String to match.
 * @param {string[]} negativeTexts Opposite strings used to match.
 * @param {int} limit Uuids length limit of response.
 * @returns {*} Uuids.
 */
export const getSimilarityUuids: IGetSimilarityUuids = async (
  url: string,
  text: string,
  negativeTexts: string[] = [],
  limit = 50
): Promise<(string | number)[]> => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      pos_text: text,
      neg_texts: negativeTexts,
      K: limit,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  })

  const json = await response.json()
  return json.uuids
}
