const proj4 = require('proj4')

proj4.defs([
	['EPSG:2263', '+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=ft +to_meter=0.3048006096012192 +no_defs'],
	['EPSG:6539', '+proj=lcc +lat_1=40.66666666666666 +lat_2=41.03333333333333 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000 +y_0=0 +ellps=GRS80 +units=us-ft +no_defs']
])

const transform = {
    proj4: proj4,
    transform: (request, response) => {
    const params = request.params
    const fromEpsg = decodeURIComponent(params.fromEpsg)
    const toEpsg = decodeURIComponent(params.toEpsg)
    const x = params.x * 1
    const y = params.y * 1
    try {
      const transformed = transform.proj4(fromEpsg, toEpsg, [x, y])
      response.end(JSON.stringify(transformed))  
    } catch (error) {
      console.error(error)
      response.status(500).send(JSON.stringify({message: error.message}))
    }
  }
}

module.exports = transform