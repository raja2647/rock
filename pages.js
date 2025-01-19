const express = require("express");
const router = express.Router();
const userController=require("../controllers/users");

router.get("/", userController.isLoggedIn, (req, res) => {
    //res.send("<h1>Hello Raja</h1>");
    //console.log(req.name);
    if(req.user){
        res.render('index',{user: req.user});
    }else{
        res.redirect("/login");
    }
    
});
router.get("/profile",userController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.render('profile',{user: req.user});
    }else{
        res.redirect("/login");
    }
});
router.get("/login",(req,res)=>{
    res.render('login');
});
router.get("/register",(req,res)=>{
    res.render('register');
});
module.exports =router;