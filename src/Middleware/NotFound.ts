import { Request, Response } from "express";

export default function(req:Request, res:Response){
    res.status(404).send('Route does not exist')
}