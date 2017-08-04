const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
	const config = require('./config.json')[env];

	// Set environment variables from our JSON file
	Object.keys(config).forEach((key) => {
		process.env[key] = config[key];
	});
}
