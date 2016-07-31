import express from 'express';

import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';

import logger from "../app/utils/logger";
import routes from "../app/http/routes";

import config from "../config";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("combined", { "stream": logger.stream }));

app.use('/', routes);

app.use(errorHandler);

function errorHandler(err, req, res, next) {
  if(err) {
    return res.status(err.status).json({message: err.message});
  }else{
    next();
  }
}

function listen(){
  app.listen(config.app.port, () =>{
    logger.info(`Express server listening on port ${config.app.port} in ${app.get('env')}`)
  });
}

export default { 
  listen 
};