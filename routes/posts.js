const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { authenticate } = require('./../middleware/authenticate');
const { Post } = require('./../models/post');

module.exports = (app) => {
	// Create a new post
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

	// Get all posts by the logged in user
	app.get('/posts', authenticate, async (req, res) => {
		try {
			const posts = await Post.find({_author: req.user._id});
			res.send({posts});
		} catch (err) {
			res.sendStatus(400);
		}
	});

	// Get a post by the logged in user
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

	// Delete a post by the logged in user
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

	// Update a post by the logged in user
	app.patch('/posts/:id', authenticate, async (req, res) => {
		const { id } = req.params;

		if (!ObjectID.isValid(id)) return res.sendStatus(404);

		const body = _.pick(req.body, ['text', 'published']);

		// If we are publishing a post, we want to create a timestamp of
		// when it was published, otherwise if we're un-publishing then
		// we should remove the timestamp.
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
};
