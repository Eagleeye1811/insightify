import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, Loader, ChevronDown, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi there! I'm your Insightify assistant. How can I help you improve your app today?",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Hide widget if we are already on the full chat page


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

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
                    content: "I'm sorry, I encountered an error. Please try again later.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (location.pathname === '/chat') {
        return null;
    }

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        style={styles.chatWindow}
                    >
                        {/* Header */}
                        <div style={styles.header}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={styles.headerIcon}>
                                    <Sparkles size={16} color="white" />
                                </div>
                                <span style={{ fontWeight: 600, color: 'white' }}>Insightify AI</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => navigate('/chat')} style={styles.closeBtn} title="Expand to full screen">
                                    <Maximize2 size={16} />
                                </button>
                                <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={styles.messagesArea}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.messageRow,
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    {msg.role === 'assistant' && (
                                        <div style={styles.avatar}>
                                            <Bot size={14} color="#fff" />
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            ...styles.bubble,
                                            background: msg.role === 'user'
                                                ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                                                : 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                        }}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                                                    ul: ({ node, ...props }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }} {...props} />,
                                                    li: ({ node, ...props }) => <li style={{ margin: '0.2rem 0' }} {...props} />,
                                                    strong: ({ node, ...props }) => <strong style={{ color: '#a78bfa' }} {...props} />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <p style={{ margin: 0 }}>{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div style={styles.messageRow}>
                                    <div style={styles.avatar}>
                                        <Bot size={14} color="#fff" />
                                    </div>
                                    <div style={{ ...styles.bubble, background: 'rgba(255, 255, 255, 0.1)' }}>
                                        <Loader className="spin" size={14} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} style={styles.inputArea}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                style={styles.input}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                style={{
                                    ...styles.sendBtn,
                                    opacity: !input.trim() || isLoading ? 0.5 : 1,
                                }}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={styles.fab}
            >
                {isOpen ? <ChevronDown size={24} /> : <Sparkles size={24} />}
            </motion.button>
        </div>
    );
};

const styles = {
    fab: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        border: 'none',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
        zIndex: 10000,
    },
    chatWindow: {
        position: 'absolute',
        bottom: '70px',
        right: '0',
        width: '350px',
        height: '500px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    },
    header: {
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerIcon: {
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
    },
    messagesArea: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    messageRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
    },
    avatar: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: '#8b5cf6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        padding: '10px 14px',
        maxWidth: '85%',
        color: '#e2e8f0',
        fontSize: '0.9rem',
        lineHeight: '1.5',
    },
    inputArea: {
        padding: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        gap: '8px',
    },
    input: {
        flex: 1,
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'white',
        outline: 'none',
        fontSize: '0.9rem',
    },
    sendBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: '#6366f1',
        border: 'none',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
};

export default ChatWidget;
