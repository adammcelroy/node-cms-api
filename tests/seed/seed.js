const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Post } = require('./../../models/post');
const { User } = require('./../../models/user');

const SEED_USER_1_ID = new ObjectID().toHexString();
const SEED_USER_2_ID = new ObjectID().toHexString();
const SEED_USERS = [
	{
		_id: SEED_USER_1_ID,
		email: 'example1@example.com',
		password: '123456',
		tokens: [{
			access: 'auth',
			token: jwt.sign({access: 'auth', _id: SEED_USER_1_ID}, process.env.JWT_SECRET).toString(),
		}],
	},
	{
		_id: SEED_USER_2_ID,
		email: 'example2@example.com',
		password: '654321',
		tokens: [{
			access: 'auth',
			token: jwt.sign({access: 'auth', _id: SEED_USER_2_ID}, process.env.JWT_SECRET).toString(),
		}],
	},
];

const SEED_POSTS = [
	{
		_id: new ObjectID(),
		_author: SEED_USERS[0]._id,
		text: 'Test data #1',
	},
	{
		_id: new ObjectID(),
		_author: SEED_USERS[1]._id,
		text: 'Test data #2',
		published: true,
		published_at: 100,
	},
];

const seedPosts = async () => {
	await Post.remove({});
	await Post.insertMany(SEED_POSTS);
};

const seedUsers = async () => {
	await User.remove({});
	await new User(SEED_USERS[0]).save();
	await new User(SEED_USERS[1]).save();
};

module.exports = {SEED_POSTS, SEED_USERS, seedPosts, seedUsers};
