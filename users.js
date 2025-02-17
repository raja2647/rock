const mysql = require("mysql");
const bcrypt=require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } =  require("util");


const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
});
console.log(__dirname);
exports.login=async(req, res)=> {
   try{
      const { email, password } = req.body;
      if(!email || !password){
         return res.status(400).render('login',
            { msg: "Please Enter Your Email and Password",
            msg_type:"error"
         });
      }

      db.query("select * from users where email=?",
         [email],
         async (error, result) => {
         console.log(result);
         if(result.length<=0){
            return res.status(400).render('login',
               { msg: " Please Enter your Email and Password",
               msg_type:"error"
            });
         }
         else{
            if(!(await bcrypt.compare(password, result[0].PASS))){
               return res.status(401).render('login', {
                  msg: " Email or Password are Incorrect..",
                  msg_type:"error"
               });
            }
            else{
                  const id=result[0].ID;
                  const token= jwt.sign({id}, process.env.JWT_SECRET, {
                     expiresIn: process.env.JWT_EXPIRES_IN
                  });
                  console.log("Token is:"  +token);
                  const cookieOptions = {
                    expires: new Date(
                     Date.now() + 
                     process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                  ),
                   httpOnly: true,
               };
               res.cookie("raja", token, cookieOptions);
               res.status(200).redirect("/");
            }
         }
      });
   }
   catch(error){
      console.log(error);
   }

};
exports.register=(req, res)=> {
    console.log(req.body);
    /*
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    console.log(name);
    console.log(email);
    //res.send("form-submitted");
    */
   const { name, email, password, confirm_password } = req.body;
   db.query("select email from users where email=?",
    [email],
    async (error,result) => {
     if(error){
      console.error("Database query failed:", error);
      return res.status(500).send("An error occurred while checking email.");
     }
     if(result.length > 0){
        return res.render('register',{ msg: "Email id already taken",
         msg_type:"error"});
     }
     else if(password!==confirm_password){
       return res.render('register',{ msg: "Password do not match",
         msg_type:"error"});
     }
     let hashedPassword =await bcrypt.hash(password,8);
     //console.log(hashedPassword);
     db.query(
      "insert into users set ?",
      {name:name,email:email,pass:hashedPassword},
      (error,result) => {
         if(error){
            console.log(error);
         }
         else{
            console.log(result);
            return res.render('register',{ msg: "User Registration Success",
            msg_type:"good"});
         }
      });

   });
};

exports.isLoggedIn = async (req, res, next) => {
   //req.name="Check Login..";
   //console.log(req.cookies);
   if(req.cookies.raja){
      try{
      const decode = await promisify(jwt.verify)(
         req.cookies.raja,
         process.env.JWT_SECRET
      );
      console.log(decode);
      db.query("select * from users where id=?",[decode.id],(err, results) =>{
         //console.log(result);
         if(!results){
            return next();
         }
         req.user = results[0];
         return next();
      });
   }
      catch(error){
      console.log(error);
      return next();
      }
  }
   else{
      next();
   }
};
exports.logout = async (req, res) =>{
   res.cookie("raja","logout",{
         expires: new Date(Date.now() + 2 * 1000),
         httpOnly: true,
   });
   res.status(200).redirect("/login");
};