var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

//--------------------------------------------------------------------
module.exports.register = function(req, res)
{
  var user = new User();

  user.name = req.body.name;
  user.email = req.body.email;

  user.setPassword(req.body.password);

  user.save(function(err)
  {
    if (err)
    {
      res.status(500).json(err);
      return;
    }
    var token = user.generateJwt();
    res.status(200).json({ "token" : token });
  });
};
//--------------------------------------------------------------------
module.exports.login = function(req, res)
{
  passport.authenticate('local', function(err, user, info)
  {
    // If Passport throws/catches an error
    if (err)
    {
      res.status(404).json(err);
    }
    else if(user)  // If a user is found
    {
      var token = user.generateJwt();
      res.status(200).json({ "token" : token });
    }
    else      // If user is not found
    {  
      res.status(401).json(info);
    }
  })(req, res);
};
//--------------------------------------------------------------------