import { useEffect } from 'react'

const useOutsideClick = (ref, callback) => {
	const handleClick = (e) => {
		if (isValidEvent(e, ref)) {
			!!callback && callback()
		}
	}

	const isValidEvent = (event, ref) => {
		if (event.button > 0) {
			return false
		}

		if (event.target) {
			const ownerDocument = event.target.ownerDocument
			if (!ownerDocument || !ownerDocument.body.contains(event.target)) {
				return false
			}
		}

		return ref.current && !ref.current.contains(event.target)
	}

	useEffect(() => {
		document.addEventListener('click', handleClick)

		return () => {
			document.removeEventListener('click', handleClick)
		}
	})
}

export default useOutsideClick
