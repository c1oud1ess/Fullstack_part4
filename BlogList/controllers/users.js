const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User.find({}).populate('blogs')
    response.json(users)
  } catch (error) {
    next(error) // 将错误传递给错误处理中间件 
  }
})

usersRouter.delete('/:id', async (request, response, next) => {
  try {
    const result = await User.findByIdAndDelete(request.params.id)
    response.status(204).json(result)
  } catch (error) {
    next(error) // 将错误传递给错误处理中间件 
  }
})

usersRouter.post('/', async (request, response, next) => {
  try {
    const { username, name, password } = request.body
    if(password.length<3){
      return response.status(400).json({
        error: 'length of password is invalid'
      })
    }else if(username.length<3){
      return response.status(400).json({
        error: 'length of username is invalid'
      })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
  } catch (error) {
    next(error) // 将错误传递给错误处理中间件 
  }
})

module.exports = usersRouter