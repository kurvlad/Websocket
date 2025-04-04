import { ChangeEvent, FC, FormEvent, useRef, useState } from "react"
import styles from './WebSock.module.css'

type Messages = {
    event: 'connection' | 'message',
    username: string,
    id: string,
    message?: string
}

const WebSock: FC = () => {
    const [text, setText] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [messages, setMessages] = useState<Messages[]>([]);
    const socket = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState<boolean>(false)

    const handleChangeText = (e: ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value)
    }
    const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    }

    const sendMessage = (e: FormEvent): void => {
        e.preventDefault();
        if (text) {
            const message = {
                username,
                message: text,
                id: Date.now(),
                event: 'message'
            }
            socket.current && socket.current.send(JSON.stringify(message))
            setText('')
        }
    }

    const connect = (e: FormEvent): void => {
        e.preventDefault();
        socket.current = new WebSocket('ws://10.100.11.62:5000/');

        socket.current.onopen = () => {
            setConnected(true);
            const message = {
                event: 'connection',
                username,
                id: Date.now()
            }
            socket.current && socket.current.send(JSON.stringify(message))
        };
        socket.current.onmessage = (event: MessageEvent): void => {
            const message = JSON.parse(event.data);
            setMessages(prev => [message, ...prev])
        };
        socket.current.onclose = (): void => {
            console.log('Socket is closed');
        };
        socket.current.onerror = (): void => {
            console.log('Socket error')
        }
    }

    const closeWebsocket = () => {
        socket.current?.close()
        setConnected(false);
        setUsername('')
    }


    if (!connected) {
        return (
            <div>
                <h1>Websocket</h1>
                <div>
                    <form >
                        <input
                            type="text"
                            value={username}
                            onChange={handleChangeUsername}
                            placeholder="имя пользователя" />
                        <button onClick={connect}>Войти</button>
                    </form>
                </div>
            </div>)
    }

    return (
        <div>
            <h1>Websocket</h1>
            <div>
                <form>

                    <input
                        type="text"
                        value={text}
                        onChange={handleChangeText}
                        placeholder="Ваше сообщение" />
                    <button onClick={sendMessage}>Отправить сообщение</button>
                </form>
                <button onClick={closeWebsocket}>Выйти</button>
            </div>
            <div className={styles.messages}>
                {messages.map(mess => {
                    return <div
                        key={mess.id}>
                        {mess.event === 'connection' ? <div className={styles.connection_message}>Пользователь {mess.username} подключился</div> : <div className={styles.message_container}>{mess.username}. {mess.message}</div>}
                    </div>
                })}
            </div>

        </div>)
}

export default WebSock