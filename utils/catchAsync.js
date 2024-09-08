module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // shorthand for .catch((err) => next(err))
  };
};
