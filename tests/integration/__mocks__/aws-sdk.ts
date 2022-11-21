import AwsSdk from 'aws-sdk'

const AWS = <typeof AwsSdk>jest.genMockFromModule('aws-sdk')

AWS.S3.prototype.getObject = <typeof AWS.S3.prototype.getObject>(<unknown>jest.fn(() => ({
  promise: () =>
    Promise.resolve({
      ContentType: 'FOO',
      Body: Buffer.from('BAR'),
    }),
})))

export default AWS
