const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/user_management_system');

const express = require('express');
const app = express();



//for User Route
const userRoute = require('./routes/userRoute');
app.use('/', userRoute);

//for Admin Route
const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);

app.listen(3000, function(){
    console.log('Server is running...');
});