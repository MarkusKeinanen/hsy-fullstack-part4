const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    //minlength: 2,
    required: true,
    unique: false
  },
  author: {
    type: String,
    //minlength: 2,
    required: false,
    unique: false
  },
  url: {
    type: String,
    //minlength: 2,
    required: true,
    unique: false
  },
  likes: {
    type: Number,
    required: false,
    unique: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// Apply the uniqueValidator plugin to userSchema.
blogSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Blog', blogSchema)