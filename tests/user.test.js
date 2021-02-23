const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneID, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

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

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  // Validate the user avatar image
  const user = await User.findById(userOneID);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Rohan Shakya 2',
    })
    .expect(200);

  // Validate a user update fields
  const user = await User.findById(userOneID);
  expect(user.name).toEqual('Rohan Shakya 2');
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Lalitpur',
    })
    .expect(400);
});

// afterEach(() => {
//   console.log('afterEach');
// });
