const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`Error: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    return res.status(404).json({ message: error.message });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate value for ${field}`;
    return res.status(400).json({ message: error.message });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  res.status(error.statusCode || 500).json({
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
