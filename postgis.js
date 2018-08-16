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
    transform.pool.query(sql, (err, res) => {
      if (err) {
        console.error(err)
        response.status(404).send()  
      } else {
        const transformed = res.rows[0]
        response.end(JSON.stringify([transformed.x, transformed.y]))
      }
    })    
  }
}

module.exports = transform