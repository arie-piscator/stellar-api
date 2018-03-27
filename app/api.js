const express = require('express')
const router = express.Router()
const middleware = require('./middleware')

router.use(middleware)

router.get('/wallet', (req, res) => {
    res.send('GET wallet')
})

module.exports = router