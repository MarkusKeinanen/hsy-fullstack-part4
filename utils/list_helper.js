const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, curr) => acc + curr.likes, 0)
}

const favoriteBlog = (blogs) => {
  let result = blogs.reduce((acc, curr) => {
    if (curr.likes > acc.likes) acc = curr
    return acc
  })
  return {
    title: result.title,
    author: result.author,
    likes: result.likes,
  }
}

const mostBlogs  = (blogs) => {
  let authors = {}
  blogs.reduce((acc, curr) => {
    if (authors[curr.author] === undefined) {
      authors[curr.author] = {
        author: curr.author,
        blogs: 1
      }
    } else {
      authors[curr.author].blogs++
    }
    return acc
  })
  return Object.keys(authors).reduce((acc, curr) => {
    if (authors[curr].blogs > authors[acc].blogs) acc = curr
    return authors[acc]
  })
}

const mostLikes = (blogs) => {
  let authors = {}
  blogs.reduce((acc, curr) => {
    if (authors[curr.author] === undefined) {
      authors[curr.author] = {
        author: curr.author,
        likes: curr.likes
      }
    } else {
      authors[curr.author].likes += curr.likes
    }
    return acc
  })
  return Object.keys(authors).reduce((acc, curr) => {
    if (authors[curr].likes > authors[acc].likes) acc = curr
    return authors[acc]
  })
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}