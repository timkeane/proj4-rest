const express = require('express')
const transform = require('./transform')

const app = express()
const port = process.env.PORT || 3000

app.get('/transform/:fromEpsg/:toEpsg/:x/:y/', transform.transform)

module.exports = app.listen(port)