const request = require('supertest');
const app = require('../src/app');

const User = require('../src/models/user');

const userOne = {
  name: 'Rohan Shakya',
  email: 'rohanshakya254@gmail.com',
  password: 'apple123!',
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should signup a new user', async () => {
  await request(app)
    .post('/users')
    .send({
      name: '  Rohan Shakya   ',
      email: 'rohanshakya.dev@gmail.com',
      password: 'rohan123!',
      age: 20,
    })
    .expect(201);
});

test('Should login existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
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

// afterEach(() => {
//   console.log('afterEach');
// });
