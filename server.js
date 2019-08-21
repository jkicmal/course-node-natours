// This is our run file
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load config file (before app)
dotenv.config({ path: './config.env' });

const app = require('./app');

// Get db url from env file and replace <PW> with actual password
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect to database
mongoose
  .connect(DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true
  })
  .then(() => {
    console.log('DB connection successful.');
  })
  .catch(err => {
    console.log('DB connection error.');
  });

// This is important, Heroku won't work with hard coded port
const port = process.env.PORT || 3000;

// Run server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
