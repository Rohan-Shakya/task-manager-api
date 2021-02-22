const express = require('express');
const connectDB = require('./db/mongoose');

const app = express();

app.use(express.json());

// connect to MONGODB
connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is up on port ${PORT}`));
