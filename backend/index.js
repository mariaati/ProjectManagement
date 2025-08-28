const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const seedUsers = require('./config/seedUsers');

dotenv.config();
const app = express();

app.use(cors({
  credentials: true,
  origin: ['http://localhost:5170'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/technologies', require('./routes/technologies'));
app.use('/api/faculties', require('./routes/faculties'));

const PORT = process.env.PORT || 6000;

async function startServer() {
  await seedUsers();
  app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
}

startServer();
