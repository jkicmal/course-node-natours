// This is try catch wrapper
// It returns same function, but with catch assigned to it
// So if it runs and error occurs it will throw the error
// All of for making code more readible (to avoid try catch blocks)
// fn is asynchronous function
module.exports = fn => {
  return (req, res, next) => {
    // .catch(next) is same as .catch(err => next(err))
    fn(req, res, next).catch(next);
  };
};
