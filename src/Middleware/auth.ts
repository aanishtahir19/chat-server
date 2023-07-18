
import jwt from 'jsonwebtoken'
import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';

config()

interface IUSER extends Request{
    user: unknown
}

const verifyToken = (req:IUSER, res:Response, next:NextFunction) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export default verifyToken