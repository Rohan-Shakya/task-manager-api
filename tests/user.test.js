const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user');

const userOneID = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneID,
  name: 'Rohan Shakya',
  email: 'rohanshakya254@gmail.com',
  password: 'apple123!',
  tokens: [
    {
      token: jwt.sign({ _id: userOneID }, process.env.JWT_SECRET),
    },
  ],
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: '  Rohan Shakya   ',
      email: 'rohanshakya.dev@gmail.com',
      password: 'rohan123!',
      age: 20,
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertion about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Rohan Shakya',
      email: 'rohanshakya.dev@gmail.com',
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe('rohan123');
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  // Validate the new user token
  const user = await User.findById(userOneID);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login none existent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'john@gmail.com',
      password: 'john123',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Validate user is removed
  const user = await User.findById(userOneID);
  expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

// afterEach(() => {
//   console.log('afterEach');
// });
