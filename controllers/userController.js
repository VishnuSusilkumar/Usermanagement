const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const securePassword = async(password) => {
    try{
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    }
    catch(error){
        console.log(error.message);
    }
}

const loadRegister = async(req, res) => {
    try{
        res.render('registration');
    }
    catch(error){
        console.log(error.message);
    }
}

const insertUser = async(req, res) => {
    try{

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // Validate password (should contain at least one uppercase, one lowercase, one digit, one special character, and be at least 8 characters long)
        if (!passwordRegex.test(req.body.password)) {
            return res.render('registration', {
                message: 'Password should contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long.'
            });
        }

        const usernameRegex = /^[a-zA-Z0-9_-]+$/;

        // Validate username
        if (!usernameRegex.test(req.body.name)) {
            return res.render('registration', {
                message: 'Username should not contain special characters.'
            });
        }


        // Validate mobile number (should have exactly 10 digits)
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(req.body.mno)) {
            return res.render('registration', { message: 'Mobile number should have 10 digits.' });
        }

        // Validate file format (jpg or png)
        const allowedFileTypes = ['jpg', 'jpeg', 'png'];
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        if (!allowedFileTypes.includes(fileExtension)) {
            return res.render('registration', { message: 'File should be in jpg or png format.' });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.render('registration', { message: 'Email is already registered. Please use a different email address.' });
        }

    

        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
            password: spassword,
            is_admin: 0,
            is_verified: 1
        });

        const userData = await user.save();

        if(userData){

            res.render('registration', {message: "Your registation has been successful."})
        }
        else{
            res.render('registration', {message: "Your registation has been failed."})
        }
    }
    catch(error){
        console.log(error.message);
    }
}

//login user methods started

const loginLoad = async(req,res) => {
    try{
        res.render('login');
    }
    catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email: email});

        if (userData) {
            
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if(passwordMatch){
                if (userData.is_verified === 0 || userData.is_admin === 1) {
                    res.render('login', {message:"Please verify your mail!"})
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
            } else {
                res.render('login', {message: "Email and password are incorrect!"});
            }

        } else {
            res.render('login', {message: "Email and password are incorrect!"});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req, res) => {
    try {
      // Check if the user is in the session and still exists
      if (req.session.user_id) {
        const userData = await User.findById({ _id: req.session.user_id });
  
        if (userData) {
          res.render('home', { user: userData });
        } else {
          // If the user does not exist, clear the session and redirect to login
          req.session.user_id = undefined;
          res.redirect('/login');
        }
      } else {
        // If the user is not in the session, redirect to login
        res.redirect('/login');
      }
    } catch (error) {
      console.log(error.message);
      res.redirect('/login'); // Redirect to login in case of an error
    }
  };

const userLogout = async(req, res) => {
    try {
        req.session.destroy();
        res.redirect('/')

    } catch (error) {
        console.log(error.message);
    }
}

//User profile edit and update

const editLoad = async(req, res) => {
    try {

        const id = req.query.id;

        const userData = await User.findById({ _id: id });

        if(userData){
            res.render('edit', {user: userData});
        } else {
            res.redirect('/home');
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async(req, res) => {
    try {

        
        if (req.file) {
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id}, {$set: {name: req.body.name, email: req.body.email, mobile: req.body.mno, image: req.file.filename}});
        } else {
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id}, {$set: {name: req.body.name, email: req.body.email, mobile: req.body.mno}});
        }

        res.redirect('/home');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    editLoad,
    updateProfile
}