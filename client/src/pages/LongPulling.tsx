import axios from "axios";
import { ChangeEvent, FC, useEffect, useState } from "react"

type Messages = {
    message: string,
    id: string,
}

const LongPulling: FC = () => {
    const [text, setText] = useState<string>('');
    const [messages, setMessages] = useState<Messages[]>([]);

    const handleChangeText = (e: ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value)
    }

    const handleSubmit = async () => {
        await axios.post('http://localhost:5000/new-messages', {
            message: text,
            id: Date.now()
        })
    }

    const subscribe = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/get-messages');
            setMessages((prev) => [data, ...prev]);
            await subscribe()
        }
        catch (e) {
            setTimeout(() => {
                subscribe()
            }, 500)
        }
    }


    useEffect(() => {
        subscribe()
    }, [])
    return <div>
        <h1>LongPulling</h1>
        <div>
            <input type="text" value={text} onChange={handleChangeText} />
            <button onClick={handleSubmit}>отправить</button>
        </div>
        <div className="messages">
            {messages.map(mess => {
                return <div className="message" key={mess.id}>{mess.message}</div>
            })}
        </div>
    </div>
}

export default LongPulling