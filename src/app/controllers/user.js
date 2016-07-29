import HttpError from '../utils/HttpError';
import User from '../models/user';
import jwt from '../utils/jwt';

function index(req, res, next) {
  if(!isAdmin(req)){
    return next(new HttpError(401));
  }

  User.find({}).then(users => {
    const {token} = getRefreshedToken(req);
    return res.json({users, token});
  });
}

function show(req, res, next) {
  User.findById(req.params.id).then(user => {
    const {token} = getRefreshedToken(req);

    if (!user) return next(new HttpError(400, `There are no user with that criteria.`));

    return res.json({user, token});
  }).catch(err => next(new HttpError(400)));
}

function edit(req, res, next) {
  if(req.params.id != req.app.locals.id){
    return next(new HttpError(401));
  }

  const {token} = getRefreshedToken(req);

  User.findById(req.params.id).then(user => {
    const {email, password, newPassword} = req.body;

    if(password){
      user.verifyPassword(password).then(match => {
        if(!match) {
          return next(new HttpError(400, `Please verify your password`));
        }

        user.email = email || user.email;

        user.password = newPassword;

        user.save()
          .then(user => saveUser(user, res))
          .catch(err => next(new HttpError(500, 'This email address is already taken, please try another')));
      })
    }else if(email){
      user.email = email;

      user.save()
        .then(user => saveUser(user, res))
        .catch(err => next(new HttpError(500, 'This email address is already taken, please try another')));
    }else{
      return next(new HttpError());
    }
  }).catch(err => next(new HttpError(400)));
}

function destroy(req, res, next) {
  if(req.params.id != req.app.locals.id && !isAdmin(req)){
    return next(new HttpError(401));
  }

  const password = req.body.password;

  if(isAdmin(req)){
    const {token} = getRefreshedToken(req);

    User.findByIdAndRemove(req.params.id)
      .then(() => {
        return res.json({message: 'User successfully deleted.', token});
      })
      .catch(() => next(new HttpError(400, `User doesn't exist`)));
  }else if(password){
    User.findById(req.params.id).then(user => {
      user.verifyPassword(password).then(match => {
        user.remove()
          .then(() => {
            return res.json({message: 'User successfully deleted.'});
          })
          .catch(err => next(new HttpError()));
      });
    });
  }else{
    return next(new HttpError());
  }
}


// Helpers
function saveUser(user, res){ 
  return res.json({token: jwt.signToken(user.id, user.role), message: 'Your profile has been successfully updated'});
}

function isAdmin(req){
  return req.app.locals.role == 'admin';
}

function getRefreshedToken(req){
  return req.app.locals.token;
}

export default {
  index,
  show,
  edit,
  destroy
}