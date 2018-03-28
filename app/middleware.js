const apiKey = process.env.API_KEY

function checkToken(req, res, next) {
    if (req.get('X-API-KEY') !== apiKey) {
        return res.status(401).send('Unauthorized.')
    }

    next()
}

module.exports = checkToken