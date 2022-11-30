const fs = require('fs')
const mockyeah = require('mockyeah')

const fetchUser = require('./fixtures/fetch-user.json')
const fetchUsers = require('./fixtures/fetch-users.json')
const fetchOperators = require('./fixtures/fetch-operators.json')
const fetchClients = require('./fixtures/fetch-clients.json')

const getRestMethod = (req, res, filePath) => {
  const file = JSON.parse(fs.readFileSync(filePath))
  const { index, limit } = req.query

  res.send({
    data: [...file].splice(req.query.index * req.query.limit, req.query.limit),
    index: Number(index),
    limit: Number(limit),
    pageCount:
      file.length % Number(limit) !== 0
        ? parseInt(file.length / Number(limit)) + 1
        : parseInt(file.length / Number(limit)),
    total: file.length,
  })
}

const getSingleRestMethod = (req, res, filePath, id) => {
  const file = JSON.parse(fs.readFileSync(filePath))
  const field = file.find(({ _id }) => _id === req.params[id])

  if (field) {
    res.send(field)
  } else if (!field || !id) {
    res.send(file[Math.floor(Math.random() * (file.length + 1))])
  } else {
    res.status(500).send({ message: 'An error occurred', error: 'ERROR_OCCURRED', code: 500 })
  }
}

mockyeah.get(/me$/, { json: fetchUser })

mockyeah.get(/projects$/, (req, res) => getRestMethod(req, res, './mocks/fixtures/fetch-projects.json'))

mockyeah.get('/api/projects/:projectId', (req, res) =>
  getSingleRestMethod(req, res, './mocks/fixtures/fetch-projects.json', 'projectId')
)

mockyeah.get(/tags/, { json: [] })

mockyeah.get(/logs/, { json: [] })

mockyeah.get(/operators/, { json: fetchOperators })

mockyeah.get(/filter/, { json: [] })

mockyeah.get('/api/projects/:projectId/items', (req, res) =>
  getRestMethod(req, res, `./mocks/fixtures/items/${req.params.projectId}.json`)
)
mockyeah.get('/api/projects/:projectId/items/:itemId', (req, res) =>
  getSingleRestMethod(req, res, `./mocks/fixtures/items/${req.params.projectId}.json`, 'itemId')
)
mockyeah.get('/api/projects/:projectId/items/next', (req, res) =>
  getSingleRestMethod(req, res, `./mocks/fixtures/items/${req.params.projectId}.json`)
)

mockyeah.get(/annotation/, { json: [] })

mockyeah.get(/users$/, { json: fetchUsers })

mockyeah.get(/azure$/, (req, res) => res.status(200).send(`<script>window.opener.postMessage('token', '*');</script>`))

mockyeah.get(/clients$/, { json: fetchClients })
