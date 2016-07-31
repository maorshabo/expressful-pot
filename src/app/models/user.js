import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    index: { unique: true },
    match: [
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    'Please fill a valid email address'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    trim: true,
    minlength: 1
  },
  passwordResetToken: String,
  passwordResetExpires: Date
});

UserSchema.pre('save', hashPassword);

UserSchema.pre('findByIdAndUpdate', hashPassword);

UserSchema.methods.verifyPassword = function(password){
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, match) => {
      (!err) ? resolve(match) : reject(err);
    });
  });
}

UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.role;
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  }
});

function hashPassword(next) {
  const user = this;

  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, saltRounds, (err, hash) => {
    if (err) return next(err);

    user.password = hash;
    next();
  });
}

export default mongoose.model('User', UserSchema);