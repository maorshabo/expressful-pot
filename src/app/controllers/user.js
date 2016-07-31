import HttpError from '../utils/HttpError';
import User from '../models/user';
import jwt from '../utils/jwt';

async function index(req, res, next) {
  if(!isAdmin(req)) return next(new HttpError(401));

  try{
    const users = await User.find({});
    const {token} = getRefreshedToken(req);

    return res.json({users, token});
  }catch(e){
    return next(new HttpError());
  }
}

async function show(req, res, next) {
  const {token} = getRefreshedToken(req);

  try{
    const user = await User.findById(req.params.id);

    if (!user) return next(new HttpError(400, `There are no user with that criteria.`));

    return res.json({user, token});
  }catch(err){
    return next(new HttpError(400));
  }
}

async function edit(req, res, next) {
  if(req.params.id != req.app.locals.id){
    return next(new HttpError(401));
  }

  const {email, password, newPassword} = req.body;

  if(!(password || email)) return next(new HttpError(400));

  try{
    const user = await User.findById(req.params.id);
    
    if(password){
      if(!newPassword) return next(new HttpError(400, `Please provide a new password`));

      const passwordVerified = await user.verifyPassword(password);

      if(!passwordVerified) return next(new HttpError(400, `Please verify your password`));

      user.password = newPassword;
    }

    user.email = email || user.email;

    const savedUser = await user.save();

    return res.json({token: jwt.signToken(savedUser.id, savedUser.role), message: 'Your profile has been successfully updated'});
  }catch(err){
    const {email, password} = err.errors;
    err = email || password || false;

    return next(new HttpError(400, err.message));
  }
}

async function destroy(req, res, next) {
  if(req.params.id != req.app.locals.id && !isAdmin(req)){
    return next(new HttpError(401));
  }

  const {password} = req.body;

  if(!password) return next(new HttpError(400, `Please provide your password`));

  if(isAdmin(req)){
    const {token} = getRefreshedToken(req);

    try{
      await User.findByIdAndRemove(req.params.id);

      return res.json({message: 'User successfully deleted.', token});
    }catch(err){
      return next(new HttpError(400, `User doesn't exist`));
    }
  }

  try{
    const user = await User.findById(req.params.id);
    const passwordVerified = await user.verifyPassword(password);
    
    if(!passwordVerified) return next(new HttpError(400, `Please verify your password`));

    await user.remove();

    return res.json({message: 'User successfully deleted.'});
  }catch(err){
    return next(new HttpError());
  }

}


// Helpers
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