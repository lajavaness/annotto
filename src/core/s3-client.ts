import AWS, { AWSError } from 'aws-sdk'
import { generateError } from '../utils/error'

export type S3Config = {
  endpoint: string
  bucket: string
  key: string
  region: string
}

class S3Client {
  /**
   * Parse a S3 compatible URL to a {S3Config} object.
   * @param {string} url: A S3 compatible URL. (i.e.: 's3://' or 'http(s)' + ://host/bucket/key).
   * @param url
   * @return {S3Config}
   * @throws InvalidS3URIException.
   */
  // eslint-disable-next-line class-methods-use-this
  parseUrlParams(url: string): S3Config {
    const _decodedUrl = decodeURIComponent(url)

    const retVal = null

    // http://s3-aws-region.amazonaws.com/bucket/key1/key2
    let _match = _decodedUrl.match(/^(https?:\/\/s3-([^.]+).amazonaws.com)\/([^\/]+)\/?(.*?)$/)
    if (_match) {
      return {
        endpoint: _match[1],
        bucket: _match[3],
        key: _match[4],
        region: _match[2],
      }
    }

    // http://bucket.s3-aws-region.amazonaws.com/key1/key2 or,
    // http://bucket.s3.aws-region.amazonaws.com/key1/key2
    _match = _decodedUrl.match(/^(https?:\/\/([^.]+).(?:s3-|s3\.)([^.]+).amazonaws.com)\/?(.*?)$/)
    if (_match) {
      return {
        endpoint: _match[1],
        bucket: _match[2],
        key: _match[4],
        region: _match[3],
      }
    }

    // Minio path style
    // http://host/bucket/key1/key2
    _match = _decodedUrl.match(/^(https?:\/\/(.*?))\/([^\/]+)\/?(.*?)$/)
    if (_match) {
      return {
        endpoint: _match[1],
        bucket: _match[3],
        key: _match[4],
        region: '',
      }
    }

    throw generateError({
      code: 400,
      message: 'ERROR_INVALID_S3_URI',
      infos: JSON.stringify(url),
    })
  }

  // eslint-disable-next-line class-methods-use-this
  async getRegion(s3: AWS.S3, s3Config: S3Config): Promise<string | AWSError> {
    return new Promise((reject, resolve) => {
      s3.getBucketLocation({ Bucket: s3Config.bucket }, (error, locationOutput) => {
        if (error) {
          reject(error)
        }
        resolve(locationOutput)
      })
    })
  }

  /**
   * Get presigned url as per the AWS SDK.
   * @param accessKeyId AWS Access Key.
   * @param secretAccessKey AWS Secret Key.
   * @param url A url to be parsed to find all necessary object for AWS to signed a url.
   * @param region The region where the bucket resides.
   */
  async getSignedUrl(accessKeyId: string, secretAccessKey: string, url: string): Promise<string> {
    const s3Config = this.parseUrlParams(url)

    const config = {
      accessKeyId,
      secretAccessKey,
      endpoint: s3Config.endpoint,
      sslEnabled: false,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    }

    AWS.config.update(config)
    const s3 = new AWS.S3({ region: s3Config.region || 'us-central-1' })

    return s3.getSignedUrlPromise('getObject', {
      Bucket: s3Config.bucket,
      Key: s3Config.key,
    })
  }
}

export default S3Client
