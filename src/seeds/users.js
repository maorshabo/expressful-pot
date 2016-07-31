import mongoose from '../bootstrap/mongoose';
import User from '../app/models/user.js';

mongoose.connect();

const userSeed = [{
  email: "admin@test.com",
  password: "password",
  role: 'admin'
},{
  email: "user@test.com",
  password: "password",
  role: 'user'
},{
  email: "test@test.com",
  password: "password",
  role: 'user'
},];

const seed = userSeed.map(user => (new User(user)).save());

Promise.all(seed).then(() => mongoose.close('Seed completed!'))
  .catch(err => mongoose.close(err.errmsg));