

exports.read = function(req, payload, done){

  payload.no_of_tags = 'NO_OF_TAGS';

  done(null, payload);

};
