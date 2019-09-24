const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

// Load config file
dotenv.config({ path: './config.env' });

// Generate link
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
    console.log('DB connection error.', err);
  });

// Read JSON file with tours data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// Import collections into tours document function
const importData = async () => {
  try {
    await Tour.create(tours); // Create many tours

    // Remember to comment out hashing functions on user model
    await User.create(users, { validateBeforeSave: false }); // Create many users

    await Review.create(reviews); // Create many reviews
    console.log('Data successfuly loaded!');
  } catch (err) {
    console.log(err);
  }
};

// Delete document data function
const deleteData = async () => {
  try {
    await Tour.deleteMany(); // Delete all tours
    await User.deleteMany(); // Delete all users
    await Review.deleteMany(); // Delete all reviews
    console.log('Data successfuly deleted!');
  } catch (err) {
    console.log(err);
  }
};

const refresh = async () => {
  await deleteData();
  await importData();
  process.exit(); // EXIT APPLICATION
};

// React to command arguments 'node run this-file.js --import'
if (process.argv[2] === '--import') {
  importData();
  process.exit(); // EXIT APPLICATION
} else if (process.argv[2] === '--delete') {
  deleteData();
  process.exit(); // EXIT APPLICATION
} else if (process.argv[2] === '--refresh') {
  refresh();
}
