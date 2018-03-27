const express = require('express')
const app = express()
const port = process.env.PORT

app.get('/', function (req, res) {
    res.send('37 BTC left.')
})

app.listen(port, () => console.log(`API running on port ${port}`))