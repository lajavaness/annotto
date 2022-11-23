import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import i18n from 'i18next'

i18n
	.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		fallbackLng: process.env.REACT_APP_LANGUAGE,
		interpolation: {
			escapeValue: false,
		},
	})

export default i18n
