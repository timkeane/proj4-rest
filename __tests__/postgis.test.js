const transform = require('../postgis')
const mockResponse = require('./response.mock')

jest.mock('pg')

let success = true
beforeEach(() => {
  mockResponse.reset()
  transform.pool.query = jest.fn((sql, callback) => {
    if (success) {
      callback(undefined, {rows: [{x: 'transformed-x', y: 'transformed-y'}]})
    } else {
      callback({message: 'sol', hint: 'good luck'})
    }
  })
})
  
test('transform success', () => {
  expect.assertions(4)
  const params = {
    fromEpsg: 'EPSG:from',
    toEpsg: 'EPSG:to',
    x: 100,
    y: 200
  }

  transform.transform({params: params}, mockResponse)

  expect(transform.pool.query).toHaveBeenCalledTimes(1)
  expect(transform.pool.query.mock.calls[0][0]).toBe(`SELECT ST_X(t.c) x,ST_Y(t.c) y FROM (SELECT ST_Transform(ST_GeomFromText('POINT(${params.x} ${params.y})',${params.fromEpsg.split(':')[1]}),${params.toEpsg.split(':')[1]}) c) t`)
  
  expect(mockResponse.send).toHaveBeenCalledTimes(1)
  expect(mockResponse.send.mock.calls[0][0]).toBe('["transformed-x","transformed-y"]')
})

test('transform error', () => {
  expect.assertions(6)

  const params = {
    fromEpsg: 'EPSG:from',
    toEpsg: 'EPSG:to',
    x: 100,
    y: 200
  }
  success = false

  transform.transform({params: params}, mockResponse)

  expect(transform.pool.query).toHaveBeenCalledTimes(1)
  expect(transform.pool.query.mock.calls[0][0]).toBe(`SELECT ST_X(t.c) x,ST_Y(t.c) y FROM (SELECT ST_Transform(ST_GeomFromText('POINT(${params.x} ${params.y})',${params.fromEpsg.split(':')[1]}),${params.toEpsg.split(':')[1]}) c) t`)
  
  expect(mockResponse.status).toHaveBeenCalledTimes(1)
  expect(mockResponse.status.mock.calls[0][0]).toBe(500)
  
  expect(mockResponse.send).toHaveBeenCalledTimes(1)
  expect(mockResponse.send.mock.calls[0][0]).toBe('{"message":"sol","hint":"good luck"}')
})