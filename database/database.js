const mongoose = require('mongoose');

// Configure Mongoose to use native promises
mongoose.promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
