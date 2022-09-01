/**
 * @file The backend code for Stranger.js
 * @author Umar Abdul
 */

import express from 'express';
import {Server} from 'socket.io';
import {v4 as uuid} from 'uuid';

const app = express();
const origin = "http://localhost:8000"

app.get("/", async (req, res) => {
  return res.json({error: "Web sockets or GTFO!"});
});

console.log("[*] Starting...");
const httpServer = app.listen(3000, () => {
  console.log("[+] Listening on port 3000...");
});

// Create the ws server
const socketServer = new Server(httpServer, {
  cors: {
    origin,
    methods: ["GET", "POST"]
  }
});

const pending = []; // For caching connected sockets

socketServer.on('connection', (client) => {
  console.log("[+] New user connected: " + client.id);
  pending.push(client);
  if (pending.length >= 2){
    // Match clients.
    const client1 = pending.shift();
    const client2 = pending.shift();
    // Handle messages.
    client1.on("message", (message) => {
      client1.emit("message", {user: "you", msg: message});
      client2.emit("message", {user: "stranger", msg: message});
    });
    client2.on("message", (message) => {
      client2.emit("message", {user: "you", msg: message});
      client1.emit("message", {user: "stranger", msg: message});      
    });
    // Handle disconnections.
    client1.on("disconnect", () => {
      disconnectUsers(client1, client2);
    });
    client2.on("disconnect", () => {
      disconnectUsers(client1, client2);
    });
    // Notify the 2 clients.
    client1.emit("user connect");
    client2.emit("user connect");
  }else{
    // Handles the disconnection of a pending client.
    client.on("disconnect", () => {
      pending.shift();
      console.log(`[-] Client quit waiting queue!`);
    });
  }
});

/**
 * Disconnect paired users.
 * @param {object} client1 - Client 1
 * @param {object} client2 - Client 2
 */
const disconnectUsers = (client1, client2) => {
  
  client1.emit("user disconnect");
  client2.emit("user disconnect");
};
