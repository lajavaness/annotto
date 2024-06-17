import { createRoot } from 'react-dom/client'

import Root from 'shared/components/Root'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<Root />)
