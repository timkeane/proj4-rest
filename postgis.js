require('dotenv').config()
const {Pool} = require('pg')

const transform = {
  pool: new Pool({connectionString: process.env.POSTGIS_URI}),
  transform: (request, response) => {
    const params = request.params
    const fromEpsg = decodeURIComponent(params.fromEpsg).split(':')[1]
    const toEpsg = decodeURIComponent(params.toEpsg).split(':')[1]
    const x = params.x
    const y = params.y
    const sql = `SELECT ST_X(t.c) x,ST_Y(t.c) y FROM (SELECT ST_Transform(ST_GeomFromText('POINT(${x} ${y})',${fromEpsg}),${toEpsg}) c) t`
    transform.pool.query(sql, (error, result) => {
      if (error) {
        response.status(500).send(JSON.stringify({
          message: error.message,
          hint: error.hint
        }))  
      } else {
        const transformed = result.rows[0]
        response.send(JSON.stringify([transformed.x, transformed.y]))
      }
    })    
  }
}

module.exports = transform