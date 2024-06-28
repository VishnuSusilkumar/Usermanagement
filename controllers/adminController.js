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

const loadLogin = async(req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req, res) => {
    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});
        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                
                if(userData.is_admin === 0){
                    res.render('login', {message: "Email and password are incorrect"})
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/admin/home');
                }

            } else {
                res.render('login', {message: "Email and password are incorrect"})
            }

        } else {
            res.render('login', {message: "Email and password are incorrect"})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req, res) => {
    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.render('home', {admin:userData});
        
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async(req, res) => {
    try {

        req.session.destroy();
        res.redirect('/admin')

    } catch (error) {
        console.log(error.message);
    }
}

const adminDashboard = async (req, res) => {
    try {
        let usersData;

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            usersData = await User.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex }
                ],
                is_admin: 0
            });
        } else {
            usersData = await User.find({ is_admin: 0 });
        }

        res.render('dashboard', { users: usersData, search: req.query.search });
    } catch (error) {
        console.log(error.message);
    }
};

//Add New User

const newUserLoad = async(req, res) => {
    try {

        res.render('new-user');
        
    } catch (error) {
        console.log(error.message);
    }
}

const addUser = async(req, res) => {
    try {

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // Validate password (should contain at least one uppercase, one lowercase, one digit, one special character, and be at least 8 characters long)
        if (!passwordRegex.test(req.body.password)) {
            return res.render('new-user', {
                message: 'Password should contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long.'
            });
        }


        // Validate mobile number (should have exactly 10 digits)
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(req.body.mno)) {
            return res.render('new-user', { message: 'Mobile number should have 10 digits.' });
        }

        // Validate file format (jpg or png)
        const allowedFileTypes = ['jpg', 'jpeg', 'png'];
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        if (!allowedFileTypes.includes(fileExtension)) {
            return res.render('new-user', { message: 'File should be in jpg or png format.' });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.render('new-user', { message: 'Email is already registered. Please use a different email address.' });
        }

        const name = req.body.name;
        const email = req.body.email;
        const mno = req.body.mno;
        const image = req.file.filename;
        const password = req.body.password;

        const spassword = await securePassword(password);

        const user = new User({
            name:name,
            email:email,
            mobile:mno,
            image:image,
            password:spassword,
            is_admin: 0,
            is_verified: 1
        });

        const userData = await user.save();

        if (userData) {

            res.redirect('/admin/dashboard');
            
        } else {
            res.render('new-user', {message: "Something wrong"})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

//Edit User Funtionality

const editUserLoad = async(req, res) => {
    try {

        const id = req.query.id;
        const userData = await User.findById({_id:id});

        if(userData){
            res.render('edit-user', {user:userData});
        } else {
            res.redirect('/admin/dashboard');
        }

        
        
    } catch (error) {
        console.log(error.message);
    }
}

const updateUsers = async(req, res) => {
    try {

        const userData = await User.findByIdAndUpdate({_id:req.body.id}, {$set:{ name: req.body.name, email: req.body.email, mobile: req.body.mno, is_verified: req.body.verify }});
        res.redirect('/admin/dashboard');
        
    } catch (error) {
        console.log(error.message);
    }
}

const deleteUser = async(req, res) => {
    try {

        const id = req.query.id;
        const userData = await User.deleteOne({ _id:id })
        res.redirect('/admin/dashboard')

    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUsers,
    deleteUser,
}