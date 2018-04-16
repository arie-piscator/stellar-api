const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT
const api = require('./api')
const bodyParser = require('body-parser')

if (process.env.STELLAR_NETWORK === 'live') {
    app.use(cors({
        origin: [/localhost$/,  /pro\.stemapp\.io$/]
    }))
}

app.use(bodyParser.json())
app.use('/api/v1', api)

app.listen(port, () => console.log(`API running on port ${port}`))