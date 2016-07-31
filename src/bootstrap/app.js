import "babel-polyfill";

import mongoose from './mongoose';
import express from './express';

// Connect to Mongo Database
mongoose.connect();

// Start express
express.listen();