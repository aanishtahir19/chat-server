import { NextFunction, Request, Response } from "express";
import CustomAPIError from "../Errors/CustomAPIError";
import httpCodes from 'http-status-codes'
export default function CustomErrorHandler(err:Error, req:Request, res:Response, next:NextFunction){
    if(err instanceof CustomAPIError){
        console.log(err.message)
        return res.status(err.status).send(err.message)
    }
     return res.status(httpCodes.INTERNAL_SERVER_ERROR).send('Something went wrong try again later')

}