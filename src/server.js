const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("./src/public/"));

app.set("view engine", "ejs");
app.set("views", "./src/views/");

io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //Chào mừng
        socket.emit("message", formatMessage("Chat bot", "Chào mừng đến với Realtime Chat App"));

        //Thong bao ket noi
        socket.broadcast
            .to(user.room)
            .emit("message", formatMessage("Chat bot", `${user.username} has joined the chat`));

        //Send users and room info
        io.to(user.room).emit("roomUsers", { room: user.room, users: getRoomUsers(user.room) });

        //Thong bao disconnect
        socket.on("disconnect", () => {
            const user = userLeave(socket.id);
            if (user) {
                io.to(user.room).emit("message", formatMessage("Chat bot", `${user.username} has left the chat`));
                io.to(user.room).emit("roomUsers", { room: user.room, users: getRoomUsers(user.room) });
            }
        });
    });

    //listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/chat", (req, res) => {
    res.render("chat");
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
