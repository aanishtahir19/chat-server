import express from 'express';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {addUser, getUser, removeUser} from './users';
import morgan from 'morgan';
import cors from 'cors';
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors:{
    origin:"*"
  }
});

io.on("connection", (socket: Socket) => {
  console.log("New Connection")
  socket.on("join", ({name, room}, callback)=> {
    console.log({name, room})
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
app.use(cors())
app.get("/", (req, res)=> res.send("Lets chat"))
const PORT = process.env.PORT;
httpServer.listen(PORT, ()=>{console.log(`Server connected on port ${PORT}`)});