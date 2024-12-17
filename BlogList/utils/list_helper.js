const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let totallikes = 0
  for(i=0;i<blogs.length;i++){
    totallikes = totallikes + blogs[i].likes
  }
  return totallikes
}

const favoriteBlog = (blogs) => {
  if(blogs.length === 1){
    return 
  }else{
    let index = 0
    let mostlikes = 0
    for(i=0;i<blogs.length;i++){
      if(blogs[i].likes > mostlikes){
        mostlikes = blogs[i].likes
        index = i
      }
    }
    result = blogs[index]
    delete result._id
    delete result.url
    delete result.__v
    return result
  }
}

module.exports = {
  dummy, totalLikes, favoriteBlog ,
}