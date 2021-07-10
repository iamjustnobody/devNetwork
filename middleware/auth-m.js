const jwt=require('jsonwebtoken')
const config=require('config');

//FOR ALL PROTECTED ROUTES
module.exports=(req,res,next)=>{
    //get token from header: 
    //when sending a request from a protected route -> need to send the token within a header
    const token=req.header('x-auth-token')

    //check if no token
    if(!token){
        return res.status(401).json({nonExistMsg:'No token, authorisation denied'});
    }

    //verify token if theres one - put it in try catch
    try{
        const decoded=jwt.verify(token,config.get('jwtSecret'));
        req.user=decoded.user;

        next();
    }catch(err){
        res.status(401).json({invalidMsg:"Token is not found"});
    }
}