const express = require('express')
const app = express()
const port = process.env.PORT
const api = require('./api')

app.use('/api/v1', api)

app.listen(port, () => console.log(`API running on port ${port}`))