import crypto from 'crypto';
import config from '../../../config';

import HttpError from '../../utils/HttpError';
import User from '../../models/user';
import jwt from '../../utils/jwt';
import logger from '../../utils/logger';

async function login(req, res, next) {
  if(!req.body.email) return next(new HttpError(500, 'Please provide an email.'));

  try{
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(new HttpError(401));

    const match = await user.verifyPassword(req.body.password);

    if(!match) return next(new HttpError(401));

    return res.json({token: jwt.signToken(user.id, user.role)});
  }catch(err){
    return next(new HttpError());
  }
}

async function signup(req, res, next) {
  if(!req.body.email) return next(new HttpError(500, 'Please provide an email.'));

  const user = await User.findOne({email: req.body.email});

  try{
    if (!user) {
      const newUser = new User({
        email: req.body.email,
        password: req.body.password
      });

      const savedUser = await newUser.save();

      return res.json({token: jwt.signToken(savedUser.id, savedUser.role)});
    }else{
      return next(new HttpError(409, `Someone already has that email. Try another?`));
    }
  }catch(err){
    const {email, password} = err.errors;
    err = email || password || false;
    return next(new HttpError(409, err.message));
  }
}

async function recovery(req, res, next) {
  if(!req.body.email) return next(new HttpError(500, 'Please provide an email.'));

  try{
    const token = await generateRandomToken();

    const user = await User.findOne({ email: req.body.email });

    if(!user){
      return next(new HttpError(409, 'No account with that email address exists.'));
    }

    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + config.app.passwordResetExpires;

    const userSaved = await user.save();

    const mailOptions = {
      to: userSaved.email,
      from: 'reset@test.com',
      subject: 'Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'+
        'Please click on the following link, or paste this into your browser to complete the process:\n\n'+
        'http://' + config.app.host + '/auth/reset/' + token + '\n\n'+
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };

    if(config.app.env == 'development'){
      logger.log('debug', mailOptions.text);

      return res.json({ 
        message: 'Message sent. Check your email.',
        mail: 'http://' + config.app.host + '/auth/reset/' + token
      });
    }

    if(config.app.env == 'production'){
      config.smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) return next(new HttpError());
        
        logger.info(`Message sent: ${info.response}`);

        return res.json({message: 'Message sent. Check your email.'});
      });
    }
  }catch(err){
    return next(new HttpError());
  }
}

async function reset(req, res, next) {
  if(!req.body.password) return next(new HttpError(500, 'Please provide a new password.'));

  try{
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: new Date }
    });

    if (!user) return next(new HttpError(409, 'Password reset token is invalid or has expired.'));

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    const savedUser = await user.save();

    const mailOptions = {
      to: savedUser.email,
      from: 'reset@test.com',
      subject: 'Your password has been changed',
      text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + savedUser.email + ' has just been changed.\n'
    };

    if(config.app.env == 'development'){
      logger.log('debug', mailOptions.text);

      return res.json({
        message: 'Your password has been changed.',
        text: mailOptions.text
      });
    }

    if(config.app.env == 'production'){
      config.smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) return next(new HttpError());
         
        logger.info('Success! Your password has been changed.');
        return res.json({message: 'Your password has been changed.'});
      });
    }
  }catch(err){
    return next(new HttpError());
  }
}

// helpers
function generateRandomToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString('hex'));
      }
    });
  });
}

export default {
  login,
  signup,
  recovery,
  reset
}