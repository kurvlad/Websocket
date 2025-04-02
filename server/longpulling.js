import express from "express";
import cors from 'cors';
import { EventEmitter } from "events";

const PORT = 5000;

const emitter = new EventEmitter();

const app = express();

app.use(cors());
app.use(express.json())

app.get('/get-messages', (req, res) => {
    emitter.once('newMessage', (message) => {
        res.json(message)
    })
});

app.post('/new-messages', (req, res) => {
    const message = req.body;
    emitter.emit('newMessage', message)
    res.status(200)
})

app.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`)
})