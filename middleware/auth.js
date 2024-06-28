const isLogin = async(req, res, next) => {
    try {
        if (req.session.user_id) {
            
        } else {
            res.redirect('/');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const nocache = (req,res,next)=>{
    res.setHeader('Cache-Control','no-store');
    next();
}

module.exports= {
    isLogin,
    isLogout,
    nocache
}