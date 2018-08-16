const mockResponse = {
  status: jest.fn(),
  send: jest.fn()
}
mockResponse.reset = () => {
  mockResponse.status.mockReset()
  mockResponse.send.mockReset()
  mockResponse.status.mockImplementation(() => {
    return mockResponse
  })
}
module.exports = mockResponse