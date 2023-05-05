const WebSocket = require('ws');
const axios = require('axios');

const SOCKET_URL = "wss://news.treeofalpha.com/ws";

// Connect to the WebSocket server
const socket = new WebSocket(SOCKET_URL);

// Function to handle incoming messages
socket.on('message', (data) => {

  try {
    const parsedMessage = JSON.parse(data);

    if (parsedMessage.type === 'ping') {
      console.log("Received ping from " + SOCKET_URL)
      socket.pong();
    }

    // Check if the message contains "FED" and "BPS" and the source is "Terminal"
    if (
      parsedMessage.source === "Terminal" &&
      parsedMessage.title.includes("FED") &&
      parsedMessage.title.includes("BPS")
    ) {
      // Regular expression to match "<number>BPS" pattern
      const regex = /(\d+)BPS/;
      const result = parsedMessage.title.match(regex);

      if (result) {
        const bps = parseInt(result[1], 10); // The first captured group contains the number of basis points

        if (bps >= 50) {
          console.log('BPS ABOVE 50 -> SENDING SHORT ORDER...');
        } else if (bps <= 10) {
          console.log('BPS BELOW 10 -> SENDING LONG ORDER...');
        } else {
          console.log(`${bps}BPS`);
        }
      } else {
        console.log("No BPS found in the message.");
      }
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

function pingSocket() {
  console.log("Pinging...");
  socket.ping();
}

// Function to handle connection open
socket.on('open', () => {
  console.log('Listening to ' + SOCKET_URL);
  socket.send('fomc');

  setInterval( () => {
    pingSocket();
  }, 5000)
});

// Function to handle connection errors
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Function to handle connection close
socket.on('close', () => {
  console.log('WebSocket connection closed.');
});
