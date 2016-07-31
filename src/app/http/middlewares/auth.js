import jwt from '../../utils/jwt';

export default async function(req, res, next) {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  try{
    const auth = await jwt.verifyToken(token);

    req.app.locals.token = auth.token;
    req.app.locals.id = auth.sub;
    req.app.locals.role = auth.role;
    next();
  }catch(err){
    return next(err);
  }
}