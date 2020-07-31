import { join } from "path";
import express from "express";
import socketIO from "socket.io";
import logger from "morgan";
import socketController from "./socketController";
import events from "./events";
const PORT = 4000;
const app = express();
app.set("view engine", "pug");
app.set("views", join(__dirname, "views"));
app.use(express.static(join(__dirname, "static")));
app.use(logger("dev"));
app.get("/", (rea, res) =>
  res.render("home", { events: JSON.stringify(events) })
);

const handleListening = () =>
  console.log(`✅Server runnig: http://localhost:${PORT}`);

const server = app.listen(PORT, handleListening);

//socketIo 가  express 서버위에 올라가도록 할 건데
// 같은 포트에서 작업할 것이다.  => 트래픽이 다르기때문
// 원래는 같은 포트에서 작업 불가능
// 2개의 HTTp 서버가 같은 포트에 있다면 동작불가능
// 그러나 WS와  HTTP는 같은 서버에서 존재할 수 있다.

const io = socketIO.listen(server);
// socketIo는 서버와 클라이언트 두역할을 다할 수 있다.

io.on("connection", (socket) => socketController(socket, io));

// 클라이언트에서도 이벤트를 듣고 있어야 한다ㅏ.
// 서버로부터 이벤트가 발생해도 쓸모가 없다 듣고있지 않으면
