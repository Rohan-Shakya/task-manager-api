const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require('../emails/account');

/*
    @route  POST /users
    @desc   Create a new user
    @access Public
*/
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

/*
    @route  POST /users/login
    @desc   Login for authorization
    @access Public
*/
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (err) {
    res.status(400).send('Sorry');
  }
});

/*
    @route  POST /users/logout
    @desc   User Logout
    @access Private
*/
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({ msg: 'Logout' });
  } catch (error) {
    res.status(500).send({ error });
  }
});

/*
    @route  POST /users/logoutAll
    @desc   Logout all the user
    @access Private
*/
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({ msg: 'Logout All' });
  } catch (err) {
    res.status(500).send({ error });
  }
});

/*
    @route  GET /users/me
    @desc   Get user details
    @access Private
*/
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

/*
    @route  PATCH /users/me
    @desc   Update user details
    @access Private
*/
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: 'Invalid updates!!' });

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();
    // const user = await User.findByIdAndUpdate(id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    res.send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});

/*
    @route  DELETE /users/me
    @desc   Delete user
    @access Private
*/
router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send({ msg: 'No delete' });
    // }

    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

const upload = multer({
  // dest: 'avatars',
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }

    cb(undefined, true);
  },
});

/*
    @route  POST /users/me/avatar
    @desc   Post a user profile picture
    @access Private
*/
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ msg: 'File uploaded' });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

/*
    @route  DELETE /users/me/avatar
    @desc   Delete user profile picture
    @access Private
*/
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send({ msg: 'image deleted' });
});

/*
    @route  GET /users/:id/avatar
    @desc   Get user profile picture
    @access Private
*/
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (err) {
    res.send(404).send({ error: 'Sorry' });
  }
});

module.exports = router;
