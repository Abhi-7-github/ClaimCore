const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const claimRoutes = require('./routes/claimRoutes');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/apiError');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Claims API is healthy',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

app.use(errorHandler);

module.exports = app;