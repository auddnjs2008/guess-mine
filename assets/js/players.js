import {
  disableCanvas,
  hideCanvasControls,
  showControls,
  enableCanvas,
  resetCanvas,
} from "./paint";
import { disableChat, enableChat } from "./Chat";

const board = document.getElementById("jsPBoard");
const notifs = document.getElementById("jsNotifs");
const timer = document.getElementById("jsTimer");
let initTime = 30;
let timeFlag = null;
let timeBroad = 0;

const timeCounter = () => {
  if (timeFlag !== null) {
    initTime--;
    timer.innerHTML = `00:${initTime >= 10 ? initTime : `0${initTime}`}`;
  } else if (initTime < 0) {
    clearTimer();
  }
};

const clearTimer = () => {
  initTime = 30;
  timeBroad = 0;
  clearInterval(timeFlag);
  timer.innerHTML = "00:00";
};

const addPlayers = (players) => {
  board.innerText = "";
  players.forEach((player) => {
    const playerElement = document.createElement("span");
    playerElement.innerText = `${player.nickname}: ${player.points}`;
    board.appendChild(playerElement);
  });
};

const setNotifs = (text) => {
  notifs.innerText = "";
  notifs.innerText = text;
};

export const handlePlayerUpdate = ({ sockets }) => addPlayers(sockets);

export const handleGameStarted = () => {
  setNotifs("");
  // disable canvas events
  disableCanvas();
  // hide the canvas controls
  hideCanvasControls();
  enableChat();
  timeBroad = timeBroad + 1;
  if (timeBroad === 1) {
    timer.innerHTML = "00:30";
    timeFlag = setInterval(timeCounter, 1000);
  }
};

export const handleLeaderNotif = ({ word }) => {
  enableCanvas();
  showControls();
  disableChat();
  notifs.innerText = `You are the leader, paint ${word} `;
};

export const handleGameEnded = () => {
  setNotifs("Game ended");
  disableCanvas();
  hideCanvasControls();
  resetCanvas();
  clearTimer();
};

export const handleGameStarting = () => setNotifs("Game will start soon");
