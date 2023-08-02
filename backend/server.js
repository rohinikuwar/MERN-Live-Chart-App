const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const openssl = require('openssl-nodejs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const DB_URI = 'mongodb://127.0.0.1:27017/userdb'; 
// Connect to MongoDB
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));


const temperatureSchema = new mongoose.Schema({
  value: Number,
  timestamp: Date,
});


const Temperature = mongoose.model('Temperature', temperatureSchema);


io.on('connection', (socket) => {
  console.log('New client connected');

  
  Temperature.find()
    .sort('-timestamp')
    .limit(10)
    .exec((err, data) => {
      if (err) {
        console.error('Error fetching initial data:', err);
      } else {
        socket.emit('initialData', data);
      }
    });

  
  socket.on('newData', (data) => {
    const { value } = data;
    const timestamp = new Date();
    const newTemperature = new Temperature({ value, timestamp });
    newTemperature.save((err) => {
      if (err) console.error('Error saving data:', err);
    });
  });

 
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = 5000;
server.listen(port, () => console.log(`Server listening on port ${port}`));
