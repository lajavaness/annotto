import S3Client from '../s3-client'

describe('S3 Client', () => {
  test('is parsing a link of type https://s3-<aws-region>.amazonaws.com/bucket/key', () => {
    const s3Client = new S3Client()
    const s3Config = s3Client.parseUrlParams(
      'https://s3-eu-central-1.amazonaws.com/data-for-demo-ljn/invoice-parsing/data/invoice/train_img/1615903900.jpeg'
    )
    expect(s3Config.key).toEqual('invoice-parsing/data/invoice/train_img/1615903900.jpeg')
    expect(s3Config.bucket).toEqual('data-for-demo-ljn')
    expect(s3Config.region).toEqual('eu-central-1')
  })

  test('is parsing a link of type http://bucket.s3-aws-region.amazonaws.com/key1/key2', () => {
    const s3Client = new S3Client()
    const s3Config = s3Client.parseUrlParams(
      'https://data-for-demo-ljn.s3-eu-central-1.amazonaws.com/invoice-parsing/data/invoice/train_img/1615903900.jpeg'
    )
    expect(s3Config.key).toEqual('invoice-parsing/data/invoice/train_img/1615903900.jpeg')
    expect(s3Config.bucket).toEqual('data-for-demo-ljn')
    expect(s3Config.region).toEqual('eu-central-1')
  })

  test('is parsing a link of type http://bucket.s3.aws-region.amazonaws.com/key1/key2', () => {
    const s3Client = new S3Client()
    const s3Config = s3Client.parseUrlParams(
      'https://data-for-demo-ljn.s3.eu-central-1.amazonaws.com/invoice-parsing/data/invoice/train_img/1615903900.jpeg'
    )
    expect(s3Config.key).toEqual('invoice-parsing/data/invoice/train_img/1615903900.jpeg')
    expect(s3Config.bucket).toEqual('data-for-demo-ljn')
    expect(s3Config.region).toEqual('eu-central-1')
  })

  test('is parsing a link of type https://host/bucket/key1/key2', () => {
    const s3Client = new S3Client()
    const s3Config = s3Client.parseUrlParams('https://host/invoice-parsing/data/invoice/train_img/1615903900.jpeg')
    expect(s3Config.key).toEqual('data/invoice/train_img/1615903900.jpeg')
    expect(s3Config.bucket).toEqual('invoice-parsing')
    expect(s3Config.region).toEqual('')
  })
})
