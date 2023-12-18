require('dotenv').config(); // Load environment variables from .env file
const mongoString = process.env.DB_CONNECTION_STRING;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB using the environment variable

mongoose.connect(mongoString);
const db = mongoose.connection;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Routes
const notesRouter = require('./routes/notes.router');
const userRouter = require('./routes/user.router');

app.use('/api/notes', notesRouter);
app.use('/api/auth', userRouter);

db.on('error', (error)=>{
    console.log(error);
});

db.once('connected', () =>{
    console.log('Database connected');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
