const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const testData = require('../utils/testData')
const helper = require('../utils/test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')


describe('when there are existing blogs', () => {

  let bearerToken
  beforeAll(async() => {
    await User.deleteMany({})
    let createUserResult = await api.post('/api/users').send(testData.testUsers[0])
      .expect(200).expect('Content-Type', /application\/json/)

    let loginResult = await api.post('/api/login').send(testData.testUsers[0])

    bearerToken = loginResult.body.token

    testData.blogs = testData.blogs.map((blog) => {
      blog.user = createUserResult.body.id
      return blog
    })

  })

  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(testData.blogs)
  })

  describe('blog return format', () => {
    test('blog id field is named .id and not ._id', async () => {
      const response = await api.get('/api/blogs')
      response.body.map((blog) => {
        expect(blog.id).toBeDefined
        expect(blog._id).not.toBeDefined
      })
    })
  })

  describe('viewing multiple blogs', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs')
      expect(response.body.length).toBe(testData.blogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
      const response = await api.get('/api/blogs')
      const urls = response.body.map(r => r.url)
      expect(urls).toContain(
        testData.blogs[0].url
      )
    })
  })

  describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToView = blogsAtStart[0]
      const resultBlog = await api.get(`/api/blogs/${blogToView.id}`)
        .expect(200).expect('Content-Type', /application\/json/)

      expect(resultBlog.body).toEqual(blogToView)
    })

    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api.get(`/api/blogs/${validNonexistingId}`).expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
      await api.get(`/api/blogs/${invalidId}`).expect(400)
    })
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const newBlog = {
        title: 'pöö',
        author: 'jaska',
        url: 'http://google.com',
        likes: 0
      }

      await api.post('/api/blogs').set('Authorization', bearerToken).send(newBlog).expect(200).expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(testData.blogs.length + 1)

      const urls = blogsAtEnd.map(b => b.url)
      expect(urls).toContain(
        'http://google.com'
      )
    })

    test('doesnt succeed without valid bearer token', async () => {
      const newBlog = {
        title: 'pöö',
        author: 'jaska',
        url: 'http://google.com',
        likes: 0
      }

      await api.post('/api/blogs').send(newBlog).expect(401).expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(testData.blogs.length)

      const urls = blogsAtEnd.map(b => b.url)
      expect(urls).not.toContain(
        'http://google.com'
      )
    })

    test('likes is set to 0 if not defined in request', async () => {
      const newBlog = {
        title: 'pöö',
        author: 'jaska',
        url: 'http://google.com',
      }
      await api.post('/api/blogs').set('Authorization', bearerToken).send(newBlog)
        .expect(200).expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(testData.blogs.length + 1)

      const foundBlog = blogsAtEnd.find((b) => b.title === newBlog.title && b.url === newBlog.url)
      expect(foundBlog).toBeDefined

      expect(foundBlog.likes).toBe(0)
    })

    test('fails with status code 400 if missing title', async () => {
      const newBlog = {
        author: 'jaska',
        url: 'http://google.com',
        likes: 0
      }
      await api.post('/api/blogs').set('Authorization', bearerToken).send(newBlog).expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(testData.blogs.length)
    })

    test('fails with status code 400 if missing url', async () => {
      const newBlog = {
        title: 'pöö',
        author: 'jaska',
        likes: 0
      }
      await api.post('/api/blogs').set('Authorization', bearerToken).send(newBlog).expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(testData.blogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', bearerToken).expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd.length).toBe(
        testData.blogs.length - 1
      )

      const urls = blogsAtEnd.map(r => r.url)
      expect(urls).not.toContain(blogToDelete.url)
    })
  })

  describe('updating of a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      blogToUpdate.url = 'huehuehuehuehuehuehu'

      await api.put(`/api/blogs/${blogToUpdate.id}`).set('Authorization', bearerToken).send(blogToUpdate)
        .expect(200).expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(testData.blogs.length)

      const urls = blogsAtEnd.map(r => r.url)
      expect(urls).toContain(blogToUpdate.url)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})