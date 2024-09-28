const express = require('express');

const app = express()

const routes = require('./routes/routes');
app.use('/', routes);

const Port = process.env.PORT || 5000;
app.listen(Port, () => {
	console.log('Server is running');
}
