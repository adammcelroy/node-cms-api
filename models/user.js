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

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const access = 'auth';
	const token = jwt.sign({access, _id: user._id.toHexString()}, process.env.JWT_SECRET).toString();

	user.tokens.push({access, token});

	await user.save();
	return token;
};

userSchema.methods.removeToken = function (token) {
	const user = this;

	return user.update({
		$pull: {
			tokens: {token},
		},
	});
};

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

userSchema.pre('save', function (next) {
	const user = this;

	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
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
