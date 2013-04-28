# fns to restrict access
exports.superuser = (req, cb)->
  user = req.user
  if not req.isAuthenticated() or not user or not user.is_super_user
    return cb null, 403
  cb null, true
exports.user = (req, cb)->
  user = req.user
  if not req.isAuthenticated() or not user or not (@user_id == user._id or user.is_super_user)
    return cb null, 403
  cb null, true
exports.any = (req, cb)->
  cb null, true