require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

require('./routes/posts')(app);
require('./routes/users')(app);

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}.`));

module.exports = {app};
