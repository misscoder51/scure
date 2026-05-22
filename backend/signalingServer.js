const WebSocket = require('ws');

const port = process.env.PORT || 5000;
const wss = new WebSocket.Server({ port }, () => {
  console.log(`Signaling server listening on port ${port}`);
});

wss.on('connection', (ws) => {
  console.log('Client connected to signaling server');

  ws.on('message', (data) => {
    // Broadcast signaling message (offer, answer, candidate) to all other connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket Error:', error);
  });
});
