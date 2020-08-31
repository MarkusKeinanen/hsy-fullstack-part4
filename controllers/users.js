const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1  })

  response.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  let errorMsg = ''
  if (!body.username || body.username.length < 3) {
    errorMsg += 'Password length must be at least 3 characters. '
  }
  if (!body.password || body.password.length < 3) {
    errorMsg += 'Username length must be at least 3 characters. '
  }
  if (errorMsg !== '') {
    return response.status(400).json(errorMsg)
  }

  const usernameExists = await User.exists({ username: body.username })
  if (usernameExists) return response.status(400).json('Username is already taken.')

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

module.exports = usersRouter