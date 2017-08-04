const { User } = require('./../models/user');

const authenticate = async (req, res, next) => {
	const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');

	try {
		const user = await User.findByToken(token);

		if (!user) throw new Error();

		req.user = user;
		req.token = token;

		next();
	} catch (err) {
		res.status(401).send();
	}
};

module.exports = {authenticate};
