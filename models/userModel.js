const mongoose = require('mongoose');
const validator = require('validator');
const bcrpyt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name field is required']
  },
  email: {
    type: String,
    required: [true, 'Email field is required'],
    unique: true,
    lowercase: true, // Transform value to lowercase
    validate: [validator.isEmail, 'Specified email ({VALUE}) is incorrect']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    // Do not include password while using eg. findOne
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on save!
      validator: function(el) {
        return el === this.password;
      },
      message: `Passwords don't match`
    }
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  // If password wasn't modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrpyt.hash(this.password, 12);

  // We need this field only for validation
  this.passwordConfirm = undefined;

  next();
});

// Instance method
userSchema.methods.correctPassword = async function(
  candidatePassword, // Not hashed
  userPassword // Hashed
) {
  // Because passwords select is set to false, we can't access it directly with 'this' keyword
  // Compare non hashed password with hashed one
  return await bcrpyt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means not changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
