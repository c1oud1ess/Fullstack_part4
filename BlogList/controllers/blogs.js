const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
  console.log(request.user.id)
  try{
    const blogs = await Blog.find({}).populate('author', { username: 1, name: 1 , id: 1})
    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  try{
    const body = request.body
    if (!body.title || !body.url) {
      response.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: title and url are required.',
      });
    }else{
      const user = request.user
      const blog = new Blog({
        title: body.title,
        author: user.id,
        url: body.url,
        likes: body.likes,
      })

      const result = await blog.save()

      user.blogs = user.blogs.concat(result._id)
      await user.save()

      response.status(201).json(result)
    }
  } catch (error) {
    next(error) 
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try{
    const user = request.user
    const blogToBeDelete = await Blog.findById(request.params.id)
    if(blogToBeDelete.author.toString() === user.id){
      const result = await blogToBeDelete.deleteOne()
      return response.status(204).json(result)
    }else{
      return response.status(401).json({ error: 'user permission invalid' })
    }
  } catch (error) {
    next(error)  
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try{
    const body = request.body
    const newBlog = {
      title: body.title,
      url: body.url,
      likes: body.likes,
    }
    const result = await Blog.findByIdAndUpdate(request.params.id, newBlog, { new: true, runValidators: true })
    response.status(200).json(result)
  } catch (error) {
    next(error)  
  }
})

module.exports = blogsRouter