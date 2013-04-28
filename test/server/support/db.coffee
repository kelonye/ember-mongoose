models = require './models'

User= models.User
Tag = models.Tag
Post = models.Post
Comment = models.Comment

exports.setUp = (done)->

  global.user = new User
    name: 'TJ'
    is_super_user: true
  user.save (err, user) ->
    return throw err if err

    global.post = new Post
      title: 'a'
      content: 'a'
    post.save (err, post) ->
      return throw err if err

      global.tag = new Tag
        name: 'a'
        post_id: post.id
      tag.save (err, tag) ->
        return throw err if err

        global.comment = new Comment
          content: 'a'
          user_id: user.id
          post_id: post.id
        comment.save done

exports.tearDown = (done)->
  Tag.find().remove().exec (err) ->
    return throw err if err
    Post.find().remove().exec (err) ->
      return throw err if err
      Comment.find().remove().exec (err) ->
        return throw err if err
        User.find().remove().exec done