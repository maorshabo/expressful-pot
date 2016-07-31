import mongoose from 'mongoose';
import config from '../config';
import logger from "../app/utils/logger";

function connect(){
  mongoose.Promise = global.Promise;

  mongoose.connect(config.db.uri);

  mongoose.connection.on('error', () => {
    logger.log('debug','MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(0);
  });

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
  process.on('SIGHUP', close);
}

function close(msg = false){
  mongoose.connection.close(() => {
    logger.log('debug', msg || 'Closing DB connections and stopping the app.');
    process.exit(0);
  });
}

export default {
  connect,
  close
}