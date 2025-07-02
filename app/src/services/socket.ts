import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  const token = localStorage.getItem("access_token");

  if (socket) {
    const oldToken = socket.auth?.token;
    if (oldToken !== token) {
      socket.disconnect();
      socket = null;
    }
  }

  if (!socket) {
    socket = io("http://localhost:8000", {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket connecté :", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur de connexion WebSocket :", err.message);
    });
  }

  return socket;
};
