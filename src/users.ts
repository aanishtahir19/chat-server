const users:User[] = [];
type User = { id: string, name: string, room:string}
export const addUser=(id:string, name:string, room:string)=>{
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    const exitingUser = users.find(user=> user.room === room && user.name === name);
    if(exitingUser){
        return {error: {message:"username is taken"}}

    }
    const user= {id, name, room};
    users.push(user);
    return {user}
}
export const removeUser = (id:string)=>{
    const index = users.findIndex(user=> user.id === id)
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}
export const getUser = (id:string)=> users.find((user)=> user.id === id)

// export const getUsersInRoom = (room)=>users.filter(user=>user.room === room)

