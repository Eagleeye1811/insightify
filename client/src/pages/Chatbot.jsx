import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm your Insightify AI Assistant. I can answer questions about your app reviews and insights. How can I help you today?",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: data.response },
            ]);
        } catch (error) {
            console.error('Error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: "I'm sorry, I encountered an error connecting to the server. Please try again later.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-page" style={styles.page}>
            <div className="chat-container" style={styles.container}>
                <div className="chat-header" style={styles.header}>
                    <div style={styles.headerContent}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textAlign: 'center',
                            letterSpacing: '0.5px'
                        }}>
                            Insightify Intelligence
                        </h2>
                    </div>
                </div>

                <div className="messages-area" style={styles.messagesArea}>
                    <AnimatePresence>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    ...styles.messageRow,
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                {msg.role === 'assistant' && (
                                    <div style={styles.avatar}>
                                        <Bot size={20} color="#fff" />
                                    </div>
                                )}

                                <div
                                    style={{
                                        ...styles.bubble,
                                        background:
                                            msg.role === 'user'
                                                ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                        border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                        borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                    }}
                                >
                                    <p style={{ margin: 0, lineHeight: '1.5' }}>{msg.content}</p>
                                </div>

                                {msg.role === 'user' && (
                                    <div style={{ ...styles.avatar, background: '#6366f1' }}>
                                        <User size={20} color="#fff" />
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    ...styles.messageRow,
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <div style={styles.avatar}>
                                    <Bot size={20} color="#fff" />
                                </div>
                                <div style={{ ...styles.bubble, background: 'rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <Loader className="spin" size={16} />
                                        <span>Thinking...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-area" style={styles.inputArea}>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your app reviews..."
                            style={styles.input}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            style={{
                                ...styles.sendButton,
                                opacity: !input.trim() || isLoading ? 0.5 : 1,
                                cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: {
        height: 'calc(100vh - 80px)', // Precise height to fit viewport below navbar
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#000', // Deep black background like Voice Agent
    },
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 10, 10, 0.4)', // Darker, cleaner glass
        backdropFilter: 'blur(20px)',
        borderRadius: '0 0 16px 16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        margin: '0',
        height: '100%',
        boxShadow: 'none', // Remove heavy shadow for cleaner look
    },
    header: {
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(0, 0, 0, 0.3)',
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    messagesArea: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    messageRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        width: '100%',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#8b5cf6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    bubble: {
        padding: '12px 16px',
        maxWidth: '70%',
        color: '#fff',
        fontSize: '0.95rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        wordWrap: 'break-word',
    },
    inputArea: {
        padding: '20px',
        borderTop: 'none',
        background: 'transparent',
        display: 'flex',
        justifyContent: 'center',
    },
    form: {
        display: 'flex',
        gap: '10px',
        position: 'relative',
        width: '100%',
        maxWidth: '700px',
        background: 'rgba(15, 15, 15, 0.8)', // Darker form background
        backdropFilter: 'blur(16px)',
        padding: '10px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: '12px',
        border: 'none',
        background: 'transparent',
        color: '#e2e8f0', // Slight off-white for better readability
        fontSize: '1rem',
        outline: 'none',
    },
    sendButton: {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        border: 'none',
        borderRadius: '16px',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        transition: 'transform 0.1s',
        flexShrink: 0,
    },
};

// Add global style for spin animation if needed, though usually better in CSS
// For now, we rely on framer-motion or simple CSS if 'spin' class exists
// If not, we can add a style tag or modify index.css. 
// Let's add a style tag to the document head dynamically or just inline keyframes?
// Inline keyframes are tricky in React inline styles. 
// We'll trust the user has a spinner or just use the text 'Thinking...'

export default Chatbot;
