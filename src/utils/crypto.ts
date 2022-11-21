import CryptoJS from 'crypto-js'
import config from '../../config'

export const encrypt = (text: string) => CryptoJS.AES.encrypt(text, config.encryptSecretKey).toString()

export const decrypt = (text: string) => {
  const bytes = CryptoJS.AES.decrypt(text, config.encryptSecretKey)

  return bytes.toString(CryptoJS.enc.Utf8)
}
