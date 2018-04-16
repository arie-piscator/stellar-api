const express = require('express')
const app = express()
const port = process.env.PORT
const api = require('./api')
const bodyParser = require('body-parser')
const ip = require('express-ipfilter');

const ips = ['::1'];

if (process.env.STELLAR_NETWORK === 'test') {
    app.use(ip.IpFilter(ips, {mode: 'allow'}))

    app.use((err, req, res, next) => {
        if (err instanceof ip.IpDeniedError) {
            return res.status(401).send('Access denied for IP')
        }
    })
}

app.use(bodyParser.json())
app.use('/api/v1', api)

app.listen(port, () => console.log(`API running on port ${port}`))