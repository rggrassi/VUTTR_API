require('../src/bootstrap');
const auth = require('../src/middlewares/auth');
const jwt = require("jsonwebtoken");
const supertest = require('supertest');

describe('Auth token', () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  }

  it('should be able possible to obtain authorization through a valid token', () => {
    const token = jwt.sign(
      {
        id: 1,
        name: "Robert Ryan",
        email: "robert.ryan@email.com",
        role: "user"
      },
      process.env.APP_SECRET,
      { expiresIn: "7d" }
    );

    const req = { 
      headers: {
        authorization: `Bearer ${token}` 
      } 
    }
    const res = {};
    const next = jest.fn();

    auth(req, res, next);
      
    expect(next).toHaveBeenCalled();
    expect(next).toHaveReturnedTimes(1);
  });

  it('should not be able to obtain authorization without sending a token', () => {
    const res = mockResponse();
    const req = { 
      headers: {} 
    }
    const next = {};
    
    auth(req, res, next);
      
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token not provided' });      
  })

  it('it should not be possible to obtain authorization with an invalid token', () => {
    const res = mockResponse();
    const req = { 
      headers: {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
          '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
          'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      } 
    }
    const next = {};
    
    auth(req, res, next);
      
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token not valid' });      
  })


})