const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) =>{
  console.log('UNCAUGHT REJECTION! SHUTTING DOWN');
  console.log(err);
  process.exit(1);
})

const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.PASSWORD);
 
const port = process.env.PORT || 3000;

mongoose.connect(DB, { useNewUrlParser: true }).then(() => {
  console.log('DB Successfully connected');
});

const server = app.listen(port, () => {
  console.log(`App is running onm the port ${port}`);
})

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! SHUTTING DOWN');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // 1 stand for uncalled exception
  }) 
})

