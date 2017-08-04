require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { User } = require('./models/user');
const { Post } = require('./models/post');

const { authenticate } = require('./middleware/authenticate');

const app = express();

app.use(bodyParser.json());

app.post('/posts', authenticate, async (req, res) => {
	const newPost = new Post({
		_author: req.user._id,
		text: req.body.text,
	});

	try {
		const post = await newPost.save();
		res.send({post});
	} catch (err) {
		res.sendStatus(400);
	}
});

app.get('/posts', authenticate, async (req, res) => {
	try {
		const posts = await Post.find({_author: req.user._id});
		res.send({posts});
	} catch (err) {
		res.sendStatus(400);
	}
});

app.get('/posts/:id', authenticate, async (req, res) => {
	const { id } = req.params;

	if (!ObjectID.isValid(id)) return res.sendStatus(404);

	try {
		const post = await Post.findOne({
			_author: req.user._id,
			_id: id,
		});

		if (!post) return res.sendStatus(404);

		res.send({post});
	} catch (err) {
		res.sendStatus(400);
	}
});

app.delete('/posts/:id', authenticate, async (req, res) => {
	const { id } = req.params;

	if (!ObjectID.isValid(id)) return res.sendStatus(404);

	try {
		const post = await Post.findOneAndRemove({
			_author: req.user._id,
			_id: id,
		});

		if (!post) return res.sendStatus(404);

		res.send({post});
	} catch (err) {
		res.sendStatus(400);
	}
});

app.patch('/posts/:id', authenticate, async (req, res) => {
	const { id } = req.params;

	if (!ObjectID.isValid(id)) return res.sendStatus(404);

	const body = _.pick(req.body, ['text', 'published']);

	if (_.isBoolean(body.published) && body.published) {
		body.published_at = new Date().getTime();
	} else {
		body.published = false;
		body.published_at = null;
	}

	try {
		const post = await Post.findOneAndUpdate({
			_author: req.user._id,
			_id: id,
		}, {$set: body}, {new: true});

		if (!post) return res.sendStatus(404);

		res.send({post});
	} catch (err) {
		res.sendStatus(400);
	}
});

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

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

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

app.delete('/users/me/token', authenticate, async (req, res) => {
	try {
		await req.user.removeToken(req.token);
		res.sendStatus(200);
	} catch (err) {
		res.sendStatus(400);
	}
});

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}.`));

module.exports = {app};
