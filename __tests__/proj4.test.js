const transform = require('../proj4')
const mockResponse = require('./response.mock')

test('proj4 has NY State Plane defs', () => {
  expect.assertions(2)
  
  expect(transform.proj4.defs['EPSG:2263']).toEqual({
    datumCode: 'nad83', 
    ellps: 'GRS80', 
    lat0: 0.7010405828843889, 
    lat1: 0.7161667697350065, 
    lat2: 0.7097672291443605,
    long0: -1.2915436464758039, 
    no_defs: true, 
    projName: 'lcc',
    to_meter: 0.3048006096012192,
    units: 'ft', 
    x0: 300000.0000000001, 
    y0: 0
  })
  expect(transform.proj4.defs['EPSG:6539']).toEqual({
    ellps: 'GRS80',
    lat0: 0.7010405828843889,
    lat1: 0.7097672291443605,
    lat2: 0.7161667697350065,
    long0: -1.2915436464758039,
    no_defs: true,
    projName: 'lcc',
    to_meter: 0.3048006096012192,
    units: 'us-ft',
    x0: 300000,
    y0: 0
  })  
})

describe('transform', () => {
  let success = true
  const proj4 = transform.proj4
  const params = {
    fromEpsg: 'EPSG:from',
    toEpsg: 'EPSG:to',
    x: 100,
    y: 200
  }
  beforeEach(() => {
    mockResponse.reset()
    transform.proj4 = jest.fn(() => {
      if (success) {
        return ['transformed-x', 'transformed-y']
      } else {
        throw {message: 'sol'}
      }
    })
  })
  afterEach(() => {
    transform.proj4 = proj4
  })

  test('transform error', () => {
    expect.assertions(6)

    transform.transform({params: params}, mockResponse)

    expect(transform.proj4).toHaveBeenCalledTimes(1)
    expect(transform.proj4.mock.calls[0][0]).toBe(params.fromEpsg)
    expect(transform.proj4.mock.calls[0][1]).toBe(params.toEpsg)
    expect(transform.proj4.mock.calls[0][2]).toEqual([params.x, params.y])
    
    expect(mockResponse.send).toHaveBeenCalledTimes(1)
    expect(mockResponse.send.mock.calls[0][0]).toBe('["transformed-x","transformed-y"]')
  })

  test('transform success', () => {
    expect.assertions(8)

    success = false

    transform.transform({params: params}, mockResponse)

    expect(transform.proj4).toHaveBeenCalledTimes(1)
    expect(transform.proj4.mock.calls[0][0]).toBe(params.fromEpsg)
    expect(transform.proj4.mock.calls[0][1]).toBe(params.toEpsg)
    expect(transform.proj4.mock.calls[0][2]).toEqual([params.x, params.y])
    
    expect(mockResponse.status).toHaveBeenCalledTimes(1)
    expect(mockResponse.status.mock.calls[0][0]).toBe(500)
    
    expect(mockResponse.send).toHaveBeenCalledTimes(1)
    expect(mockResponse.send.mock.calls[0][0]).toBe('{"message":"sol"}')
  })
})
