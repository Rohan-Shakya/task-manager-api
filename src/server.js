const express = require('express');
const connectDB = require('./db/mongoose');
const UserRouter = require('./routers/user');
const TaskRouter = require('./routers/task');

const app = express();

app.use(express.json());

// connect to MONGODB
connectDB();

app.use(UserRouter);
app.use(TaskRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is up on port ${PORT}`));
