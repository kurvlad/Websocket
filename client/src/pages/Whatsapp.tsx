import { ChangeEvent, FC, FormEvent, useRef, useState, useEffect } from "react"
import styles from './Whatsapp.module.css'

type Messages = {
    event: 'connection' | 'message',
    username: string,
    id: string,
    message?: string,
    date?: string
}
const Whatsapp: FC = () => {
    const [text, setText] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [messages, setMessages] = useState<Messages[]>([]);
    const socket = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const handleChangeText = (e: ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value)
    }

    const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    }

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const sendMessage = (e: FormEvent): void => {
        e.preventDefault();
        if (text.trim()) {
            const message = {
                username,
                message: text,
                id: Date.now(),
                event: 'message',
                date: getCurrentTime()
            }
            socket.current && socket.current.send(JSON.stringify(message))
            setText('')
        }
    }

    const connect = (e: FormEvent): void => {
        e.preventDefault();
        if (!username.trim()) return;

        socket.current = new WebSocket('ws://10.100.11.62:5000/');

        socket.current.onopen = () => {
            setConnected(true);
            const message = {
                event: 'connection',
                username,
                id: Date.now(),
                date: getCurrentTime()
            }
            socket.current && socket.current.send(JSON.stringify(message))
        };

        socket.current.onmessage = (event: MessageEvent): void => {
            const message = JSON.parse(event.data);
            setMessages(prev => [...prev, { ...message, date: getCurrentTime() }])
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
        setUsername('');
        setMessages([]);
    }

    if (!connected) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authBox}>
                    <h1 className={styles.appTitle}>WhatsApp Web</h1>
                    <form className={styles.authForm}>
                        <input
                            className={styles.authInput}
                            type="text"
                            value={username}
                            onChange={handleChangeUsername}
                            placeholder="Введите ваше имя"
                            required
                        />
                        <button
                            className={styles.authButton}
                            onClick={connect}
                            disabled={!username.trim()}
                        >
                            Продолжить
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <div className={styles.chatTitle}>WhatsApp Web</div>
                <button
                    className={styles.exitButton}
                    onClick={closeWebsocket}
                >
                    Выйти
                </button>
            </div>

            <div className={styles.messagesContainer}>
                {messages.map((mess) => {
                    const isMyMessage = mess.username === username;

                    if (mess.event === 'connection') {
                        return (
                            <div key={mess.id} className={styles.systemMessage}>
                                Пользователь {mess.username} подключился
                                <span className={styles.messageTime}>{mess.date}</span>
                            </div>
                        )
                    }

                    return (
                        <div
                            key={mess.id}
                            className={`${styles.messageBubble} ${isMyMessage ? styles.myMessage : styles.otherMessage}`}
                        >
                            {!isMyMessage && (
                                <div className={styles.senderName}>{mess.username}</div>
                            )}
                            <div className={styles.messageText}>{mess.message}</div>
                            <div className={styles.messageTime}>{mess.date}</div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <form className={styles.messageForm} onSubmit={sendMessage}>
                <input
                    className={styles.messageInput}
                    type="text"
                    value={text}
                    onChange={handleChangeText}
                    placeholder="Введите сообщение"
                />
                <button
                    className={styles.sendButton}
                    type="submit"
                    disabled={!text.trim()}
                >
                    Отправить
                </button>
            </form>
        </div>
    )
}

export default Whatsapp