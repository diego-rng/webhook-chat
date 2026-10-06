import { WebSocketServer } from 'ws'

const port = 8080;
const wss = new WebSocketServer({port});  

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    console.log(`Received message from client: ${data}`);
    ws.send(`Message received!`)
  })

  ws.send(`Hello, this is main.ts`)
})

console.log(`Listening at ${port}`)