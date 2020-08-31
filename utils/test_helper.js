const Blog = require('../models/blog')
const User = require('../models/user')

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'removable',
    author: 'removable',
    url: 'removable',
    likes: Number(0)
  })
  await blog.save()
  await blog.remove()
  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  return blogs.map(b => b.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  nonExistingId, blogsInDb, usersInDb
}