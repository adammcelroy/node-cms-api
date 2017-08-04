const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email',
		},
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
	},
	tokens: [{
		access: {
			type: String,
			required: true,
		},
		token: {
			type: String,
			required: true,
		},
	}],
});

// We want to handpick user data we send back
userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	return _.pick(userObject, ['_id', 'email']);
};

// Create a new auth token and save it to the user document
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const access = 'auth';
	const token = jwt.sign({access, _id: user._id.toHexString()}, process.env.JWT_SECRET).toString();

	user.tokens.push({access, token});

	await user.save();
	return token;
};

// Remove an auth token from the user documents
userSchema.methods.removeToken = function (token) {
	const user = this;

	return user.update({
		$pull: {
			tokens: {token},
		},
	});
};

// Find a user that has a specific auth token
userSchema.statics.findByToken = function (token) {
	const User = this;
	let decoded;

	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		return Promise.reject();
	}

	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth',
	});
};

// Find a user by email and password combo
userSchema.statics.findByCredentials = async function (email, password) {
	const User = this;

	const user = await User.findOne({email});

	if (!user) throw new Error();

	// bcrypt supports callbacks only so let's wrap in a promise
	return new Promise((resolve, reject) => {
		// Compare plain password with stored hashed password
		bcrypt.compare(password, user.password, (err, res) => {
			if (res) resolve(user);
			else reject();
		});
	});
};

// Ensure that password hashing happens automatically rather than
// needing to remember to do it manually each time. Also prevents
// against accidentally hashing an already hashed password.
userSchema.pre('save', function (next) {
	const user = this;

	if (user.isModified('password')) {
		bcrypt.genSalt((err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}
});

const User = mongoose.model('User', userSchema);

module.exports = {User};
