export default function (err, req, res, next) {
  if(err) {
    return res.status(err.status).json({message: err.message});
  }else{
    next();
  }
}