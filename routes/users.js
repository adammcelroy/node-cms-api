const _ = require('lodash');

const { authenticate } = require('./../middleware/authenticate');
const { User } = require('./../models/user');

module.exports = (app) => {
	// Create a new user
	app.post('/users', async (req, res) => {
		const body = _.pick(req.body, ['email', 'password']);
		const user = new User(body);

		try {
			await user.save();
			const token = await user.generateAuthToken();
			res.header('Authorization', `Bearer ${token}`).send(user);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	// Log the user in
	app.post('/users/login', async (req, res) => {
		const body = _.pick(req.body, ['email', 'password']);

		try {
			const user = await User.findByCredentials(body.email, body.password);
			const token = await user.generateAuthToken();
			res.header('Authorization', `Bearer ${token}`).send(user);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	// Log the user out
	app.delete('/users/me/token', authenticate, async (req, res) => {
		try {
			await req.user.removeToken(req.token);
			res.sendStatus(200);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	// Get the logged in user
	app.get('/users/me', authenticate, (req, res) => res.send(req.user));
};
