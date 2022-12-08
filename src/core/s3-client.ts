import AWS from 'aws-sdk'
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

    let retVal = null
    // http://s3.amazonaws.com/bucket/key1/key2
    let _match = _decodedUrl.match(/^(https?:\/\/s3.amazonaws.com)\/([^\/]+)\/?(.*?)$/)
    if (_match) {
      retVal = {
        endpoint: _match[1],
        bucket: _match[2],
        key: _match[3],
        region: '',
      }
    }

    // http://s3-aws-region.amazonaws.com/bucket/key1/key2
    _match = _decodedUrl.match(/^(https?:\/\/s3-([^.]+).amazonaws.com)\/([^\/]+)\/?(.*?)$/)
    if (_match) {
      retVal = {
        endpoint: _match[1],
        bucket: _match[3],
        key: _match[4],
        region: _match[2],
      }
    }

    // http://bucket.s3.amazonaws.com/key1/key2
    _match = _decodedUrl.match(/^(https?:\/\/([^.]+).s3.amazonaws.com)\/?(.*?)$/)
    if (_match) {
      retVal = {
        endpoint: _match[1],
        bucket: _match[2],
        key: _match[3],
        region: '',
      }
    }

    // http://bucket.s3-aws-region.amazonaws.com/key1/key2 or,
    // http://bucket.s3.aws-region.amazonaws.com/key1/key2
    _match = _decodedUrl.match(/^(https?:\/\/([^.]+).(?:s3-|s3\.)([^.]+).amazonaws.com)\/?(.*?)$/)
    if (_match) {
      retVal = {
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
      retVal = {
        endpoint: _match[1],
        bucket: _match[3],
        key: _match[4],
        region: '',
      }
    }

    if (!retVal) {
      throw generateError({
        code: 400,
        message: 'ERROR_INVALID_S3_URI',
        infos: JSON.stringify(url),
      })
    }

    return retVal
  }

  // eslint-disable-next-line class-methods-use-this
  getSignedUrl(accessKeyId: string, secretAccessKey: string, url: string): Promise<string> {
    const s3Config = this.parseUrlParams(url)
    const config = {
      accessKeyId,
      secretAccessKey,
      endpoint: s3Config.endpoint,
      sslEnabled: false,
      s3ForcePathStyle: true,
    }
    AWS.config.update(config)
    const s3 = new AWS.S3()

    return s3.getSignedUrlPromise('getObject', {
      Bucket: s3Config.bucket,
      Key: s3Config.key,
    })
  }
}

export default S3Client
