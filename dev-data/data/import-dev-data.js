const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
dotenv.config({ path: './config.env' });


const DB = process.env.DATABASE.replace('<password>', process.env.PASSWORD);

mongoose.connect(DB).then(() => {
  console.log('DB Successfully connected');
});


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//Import data into DB

const importData = async () =>{
  try {
    await User.create(users, {
      validateBeforeSave: false
    });
    await Review.create(reviews);
    await Tour.create(tours);

    console.log('Data Successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
}

const deleteData = async () =>{
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Deleted Successfully');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete'){
  deleteData();
}
