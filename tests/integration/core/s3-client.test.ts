import CryptoJS from 'crypto-js'
import AwsClient from '../../../src/core/s3-client'

describe('S3 Client', () => {
  test('can presigned a url for Minio S3 server', async () => {
    const s3Client = new AwsClient()
    const url = await s3Client.getSignedUrl(
      'admin',
      'supersecret',
      'http://127.0.0.1:9000/annotto/Screenshot%202022-12-07%20at%2013.59.44.png'
    )
    expect(url).toBeDefined()
  })

  test('can presigned a url for AWS S3 server', async () => {
    const s3Client = new AwsClient()
    // const accessKeyEnc = 'U2FsdGVkX18jtQsHrHcIGE9ENYxOfbhi1n8PlRhfKFuDpILPiNyeoYg4eWUeElFZ'
    // const secretKeyEnc = 'U2FsdGVkX1+pOYoKbtmrxuKzzXLibUmT3PEbOdTMgsuhD4UUCij4UtZqOBHNJtAAFDG20+2icEhSG3mD0AWErg=='
    const accessKeyEnc = 'U2FsdGVkX18oOECl/sf1OVb574B8yt1E63iruJlb6YXQ7CZz/qh6x8pbQ98EQMLI'
    const secretKeyEnc = 'U2FsdGVkX185VkxpUdFa4jDef7UcS6a8fs0Ywo6K3c/pdJbBJp7V8nyWy+jUgxRc9Cw7gWtZ2pKFKGzDWMq/Pg=='
    const secret = 't6w9z$C&F)J@NcRfTjWnZr4u7x!A%D*GoKaPdSgVkXp2s5v8y/B?E(H+MbQeThWm'

    const url = await s3Client.getSignedUrl(
      CryptoJS.AES.decrypt(accessKeyEnc, secret).toString(CryptoJS.enc.Utf8),
      CryptoJS.AES.decrypt(secretKeyEnc, secret).toString(CryptoJS.enc.Utf8),
      'https://s3-eu-west-3.amazonaws.com/pollentrack/data/lames_sauvages/METZ_220520_AAAV_03.jpg'
    )
    console.log(url)
    expect(url).toBeDefined()
  })
})
