import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

export const token = async (req,res,next)=>{
  
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"You Are Not Logged In"
        });
    }

    jwt.verify(token,process.env.JWT_SECRET, (err,decoded)=>{
        if(err){
            return res.status(401).json({
                message:"Invalid or expired token"
            })
        };

        req.user = decoded;

        next()
    });
}


export const verifyRole = (req,res,next)=>{
    if(!req.user){
        return res.status(401).json({
            message:"Unauthorised"
        })
    }

    if(req.user.role !== "Admin"){
        return res.status(403).json({
            message:"You are not authorized to perform this action"
        })
    }

    next()
}