import { Server } from "socket.io";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*", // restrict in production
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ orderId }) => {
      socket.join(`order:${orderId}`);
    });

    socket.on("leave", ({ orderId }) => {
      socket.leave(`order:${orderId}`);
    });
  });

  return io;
}

export { io };
