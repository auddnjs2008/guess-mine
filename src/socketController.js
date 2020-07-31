import events from "./events";
import { chooseWord } from "./words";

let sockets = [];
let inProgress = false;
let word = null;
let leader = null;
let timeout = null;

const chooseLeader = () => sockets[Math.floor(Math.random() * sockets.length)];

const socketController = (socket, io) => {
  const broadcast = (event, data) => socket.broadcast.emit(event, data);

  const superBroadcast = (event, data) => io.emit(event, data);

  //io.emit을 사용하면 socket.broadcast와 달리  자기자신을 포함한 모든
  // client들에게 메세지를 보낸다.

  const startGame = () => {
    if (sockets.length > 1) {
      if (inProgress === false) {
        inProgress = true;
        leader = chooseLeader();
        word = chooseWord();
        superBroadcast(events.gameStarting);
        setTimeout(() => {
          superBroadcast(events.gameStarted);
          io.to(leader.id).emit(events.leaderNotif, { word });
          timeout = setTimeout(endGame, 30000);
        }, 5000);
      }
    }
  };

  const endGame = () => {
    inProgress = false;
    if (sockets.length === 1) clearPoints();
    superBroadcast(events.gameEnded);
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    setTimeout(() => startGame(), 2000);
  };

  const addPoints = (id) => {
    sockets = sockets.map((socket) => {
      if (socket.id === id) {
        socket.points += 10;
      }
      return socket;
    });
    sendPlayerUpdate();
    endGame();
    clearTimeout(timeout);
  };

  const clearPoints = () => {
    sockets = sockets.map((socket) => {
      if (socket.points > 0) socket.points = 0;
      return socket;
    });
  };

  const sendPlayerUpdate = () =>
    superBroadcast(events.playerUpdate, { sockets });

  socket.on(events.setNickname, ({ nickname }) => {
    socket.nickname = nickname;
    sockets.push({ id: socket.id, points: 0, nickname: nickname });
    broadcast(events.newUser, { nickname });
    sendPlayerUpdate();
    startGame();
  });
  socket.on(events.disconnect, () => {
    sockets = sockets.filter((aSocket) => aSocket.id !== socket.id);
    if (sockets.length === 1) {
      endGame();
    } else if (leader) {
      if (leader.id === socket.id) {
        endGame();
      }
    }
    broadcast(events.disconnected, { nickname: socket.nickname });
    sendPlayerUpdate();
  });
  socket.on(events.sendMsg, ({ message }) => {
    if (message === word) {
      superBroadcast(events.newMsg, {
        message: `Winner is ${socket.nickname}, word was: ${word}`,
        nickname: "Bot",
      });
      addPoints(socket.id);
    } else {
      broadcast(events.newMsg, { message, nickname: socket.nickname });
    }
  });

  socket.on(events.beginPath, ({ x, y }) =>
    broadcast(events.beganPath, { x, y })
  );

  socket.on(events.strokePath, ({ x, y, color }) =>
    broadcast(events.strokedPath, { x, y, color })
  );

  socket.on(events.fill, ({ color }) => {
    broadcast(events.filled, { color });
  });
};

export default socketController;

// // 이 socket은 방금 연결된 socket이다.
//   //socket.emit("hello"); // 1명이 연결되면 서버에서 hello를 보내준다.

//   //setTimeout(() => socket.broadcast.emit("hello"), 5000);
//   // broadcast는 방금 접속한 클라이언트를 제외하고
//   // 모든 클라이언트들에게 메시지를 보낸다.
//   // 즉 현재 연결된 소켓을 제외한 모든 소켓에 이벤트를 보낸다.
//   socket.on("newMessage", ({ message }) => {
//     socket.broadcast.emit("messageNotif", {
//       message,
//       nickname: socket.nickname || "Anon",
//     }); // 이벤트와 함께 정보가 들어있는 data 객체를 받을수있다.
//   });

//   socket.on("setNickname", ({ nickname }) => {
//     socket.nickname = nickname;
//     //소켓은 그냥 객체이다. 우리가 원하는 걸 첨부해줄수 있다.
//     //socket.potato = 5 같은 것도 가능하다.
//   });
