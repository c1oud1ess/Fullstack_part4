const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  }
]

// beforeEach(async () => {
//   await Blog.deleteMany({})
//   let blogObject = new Blog(initialBlogs[0])
//   await blogObject.save()
//   blogObject = new Blog(initialBlogs[1])
//   await blogObject.save()
// })

test('blogs are returned as json, and the amount of blog posts is correct', async () => {
  const response = await api
  .get('/api/blogs')
  .expect(200)
  .expect('Content-Type', /application\/json/)
  assert.strictEqual(response.body.length, 2)
})


test('blogs have unique id', async () => {
  const response = await api.get('/api/blogs')
  response.body.map(blog =>{
    assert.strictEqual(blog.id === null,false)
    assert.strictEqual(blog._id,undefined)
  })
})

describe.only('addition of a new blog', () => {
  test('a valid blog can be added ', async () => {
    const newBlog =   {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
      __v: 0
    }

    const originalResponse = await api.get('/api/blogs')

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const addedResponse = await api.get('/api/blogs')
    const titles = addedResponse.body.map(r => r.title)

    assert.strictEqual(addedResponse.body.length, originalResponse.body.length+1)

    assert(titles.includes('Type wars'))
  })

  test('if the likes property is missing from the request, it will default to the value 0 ', async () => {
    const newBlog =   {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const lengthOfResponse = response.body.length

    assert.strictEqual(response.body[lengthOfResponse-1].likes, 0)
  })

  test('if the title or url properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request.', async () => {
    const newBlog1 =  {
      _id: "5a422bc61b54a676234d17fc",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 1,
      __v: 0
    }

    const newBlog2 =  {
      _id: "5a422ba71b54a676234d17fb",
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      likes: 0,
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog1)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(newBlog2)
      .expect(400)

  })

  test.only('if the authorization is missing from the request data, the backend responds to the request with the status code 401 Unauthorized.', async () => {
    const newBlog1 =  new Blog({
      title: "test3",
      author: "6759c59c94ced1152f04eae0",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 1,
    })

    await api
      .post('/api/blogs')
      .send(newBlog1)
      .expect(401)

  })
})

describe('deletion of a blog', () => {
  test('succeeds in deleting with status code 204 if id is valid', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]
    

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    // console.log(blogsAtEnd)
    // console.log(blogsAtEnd.body)
    assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1)

    const authors = blogsAtEnd.body.map(r => r.author)
    assert(!authors.includes(blogToDelete.author))
  })
})

describe('Update of a blog', () => {
  test('succeeds in updating with status code 200 if id is valid', async () => {
    const blogsBeforeUpdate = await api.get('/api/blogs')
    const blogToUpdate = {
      ...blogsBeforeUpdate.body[0],
      likes: 99
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)

    const blogsAfterUpdate = await api.get('/api/blogs')
    assert.strictEqual(blogsAfterUpdate.body[0].likes, 99)
  })
})

after(async () => {
  await mongoose.connection.close()
})