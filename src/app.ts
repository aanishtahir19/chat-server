import express, { Request, Response, NextFunction } from 'express';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {addUser, getUser, removeUser} from './users';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import sqlite3 from "sqlite3";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import verifyToken from './Middleware/auth';
import CustomErrorHandler from './Middleware/CustomErrorHandler';

const DBSOURCE = "usersdb.sqlite";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  } 
  else {        
      const salt = bcrypt.genSaltSync(10);
      
      db.run(`CREATE TABLE Users (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          Email text, 
          Password text,             
          Salt text,    
          Token text,
          DateLoggedIn DATE,
          DateCreated DATE
          )`,
      (err) => {
          if (err) {
              // Table already created
          } else{
              // Table just created, creating some rows
              const insert = 'INSERT INTO Users (Email, Password, Salt, DateCreated) VALUES (?,?,?,?,?)'
              db.run(insert, ["user1@example.com", bcrypt.hashSync("user1", salt), salt, Date()])
              db.run(insert, [ "user2@example.com", bcrypt.hashSync("user2", salt), salt, Date()])
              db.run(insert, ["user3@example.com", bcrypt.hashSync("user3", salt), salt, Date()])
              db.run(insert, ["user4@example.com", bcrypt.hashSync("user4", salt), salt, Date()])
          }
      });  
  }
});

dotenv.config()
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors:{
    origin:"*"
  }
});


io.on("connection", (socket: Socket) => {
  if(!socket.handshake.query?.token){
    return 
  }
  
  socket.on("join", ({name, room, token}, callback)=> {
    const {user, error} = addUser(socket.id, name, room);
    if(error) {
      if(callback)return callback(error.message)
      return;
    }
    socket.broadcast.to(user.room).emit("message",{user:'admin', text:`${user.name} has just joined`})
    socket.emit("message", {user:'admin', text:`Welcome to ${user.room}`})
    socket.join(user.room);
    socket.on("sendMessage", (message)=>{
      console.log(message);
      
      io.to(user.room).emit("sendMessage",{text:message, user:user.name})
    })
  })
  socket.on("disconnect_user", ()=>{
    console.log("User disconnected");
    removeUser(socket.id)
  })
});
app.use(morgan("dev"));
app.use(express.json())
app.use(
  express.urlencoded(),
  cors({
      origin: '*'
  })
);



app.post("/api/register", async (req, res) => {
  const errors=[]
  try {
      const { Email, Password } = req.body;
      if (!Email){
          errors.push("Email is missing");
      }
      if (errors.length){
          res.status(400).json({"error":errors.join(",")});
          return;
      }
      let userExists = false;
      
      
      const sql = "SELECT * FROM Users WHERE Email = ?"        
      await db.all(sql, Email, (err, result) => {
          if (err) {
              res.status(402).json({"error":err.message});
              return;
          }
          
          if(result.length === 0) {                
              
              const salt = bcrypt.genSaltSync(10);

              const data = {
                  Email: Email,
                  Password: bcrypt.hashSync(Password, salt),
                  Salt: salt,
                  DateCreated: Date()
              }
      
              const sql ='INSERT INTO Users (Email, Password, Salt, DateCreated) VALUES (?,?,?,?)'
              const params =[data.Email, data.Password, data.Salt, Date()]
              const user = db.run(sql, params, function (err:any, innerResult:any) {
                  if (err){
                      res.status(400).json({"error": err.message})
                      return;
                  }
                
              });           
          }            
          else {
              userExists = true;
              // res.status(404).send("User Already Exist. Please Login");  
          }
      });

      setTimeout(() => {
          if(!userExists) {
              res.status(201).json("Success");    
          } else {
              res.status(201).json("Record already exists. Please login");    
          }            
      }, 500);
      

  } catch (err) {
    console.log(err);
  }
})
app.post("/api/login", async (req, res) => {
  
  try {      
    const { Email, Password } = req.body;
        // Make sure there is an Email and Password in the request
        if (!(Email && Password)) {
            res.status(400).send("All input is required");
        }
            
        const user = [] as any[];
        
        const sql = "SELECT * FROM Users WHERE Email = ?";
        db.all(sql, Email, function(err, rows) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }

            rows.forEach(function (row) {
                user.push(row);                
            })

            if(user.length === 0) return res.status(400).send("User Not Found");
            
            const PHash = bcrypt.hashSync(Password, user[0].Salt);
       
            if(PHash === user[0].Password) {
                // * CREATE JWT TOKEN
                const token = jwt.sign(
                    { user_id: user[0].Id, Email },
                      process.env.TOKEN_KEY,
                    {
                      expiresIn: "1h", // 60s = 60 seconds - (60m = 60 minutes, 2h = 2 hours, 2d = 2 days)
                    }  
                );

                user[0].Token = token;

            } else {
                return res.status(400).send("No Match");          
            }

           return res.status(200).send(user);                
        });	
    
    } catch (err) {
      console.log(err);
    }    
});

app.use(verifyToken)
app.use(CustomErrorHandler)
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, ()=>{console.log(`Server connected on port ${PORT}`)});