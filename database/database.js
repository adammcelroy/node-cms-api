const mongoose = require('mongoose');

// Use native promises
mongoose.promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
