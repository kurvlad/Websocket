import { WebSocketServer } from "ws"

const wss = new WebSocketServer({
    port: 5000
}, () => {
    console.log('server started')
})

const broadcastMessage = (message) => {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(message))
    })
}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        message = JSON.parse(message);
        switch (message.event) {
            case 'message':
                broadcastMessage(message)
                break;
            case 'connection':
                broadcastMessage(message)
                break;
        }
    })
})


const message = {
    event: 'message/connection',
    id: 123,
    date: '02.04.2025',
    username: 'vlad',
    message: 'hello'
}
