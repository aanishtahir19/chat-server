import { Request, Response } from "express";
import * as Errors from '../Errors/Index';

export default function MainController(req:Request, res:Response){
    throw new Errors.NotFoundError("Not Found")
}