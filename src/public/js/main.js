const roomName = document.querySelector("#room-name");
const userList = document.querySelector("#users");
const chatMessages = document.querySelector(".chat-messages");
const chatForm = document.querySelector("#chat-form");

const socket = io();

//Get username and room for URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

//Join chatroom
socket.emit("joinRoom", { username, room });

//Get room and users
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

//Message from server
socket.on("message", (msg) => {
    console.log(msg);
    outputMessage(msg);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    //get message text
    const msg = e.target.elements.msg.value;

    //Emit message to the server
    socket.emit("chatMessage", msg);

    //clear input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

//Output message to DOM
function outputMessage(msg) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
    <p class="text">
        ${msg.text}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}

//Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

//Add username to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}
