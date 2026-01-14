import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, Loader, ChevronDown, Maximize2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi there! I'm your Insightify AI assistant. How can I help you improve your app today?",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

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
            // Get user ID from AuthContext
            const userId = user?.uid || 'anonymous';
            
            console.log('Sending chat request with userId:', userId);

            const response = await fetch('http://localhost:5001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userMessage,
                    userId: userId 
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            
            // Check for rate limit error
            if (data.error === 'rate_limit') {
                setMessages((prev) => [
                    ...prev,
                    { 
                        role: 'assistant', 
                        content: "⏰ " + data.response,
                        intent: data.intent,
                        hasData: false 
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { 
                        role: 'assistant', 
                        content: data.response,
                        intent: data.intent,
                        hasData: data.hasData 
                    },
                ]);
            }
        } catch (error) {
            console.error('Error:', error);
            
            let errorMessage = "I apologize, but I'm having trouble connecting to the server right now. Please make sure the backend server is running on port 5001 and try again.\n\nIn the meantime, I can still help with general questions! What would you like to know?";
            
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: errorMessage,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Hide widget if we are already on the full chat page
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
                                <img 
                                    src={logo} 
                                    alt="Insightify" 
                                    style={styles.headerLogo}
                                />
                                <div>
                                    <span style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>
                                        Insightify AI
                                    </span>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(167, 139, 250, 0.8)', marginTop: '2px' }}>
                                        {user ? 'Ready to help!' : 'Login for personalized insights'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <motion.button 
                                    onClick={() => {
                                        // Pass chat history to full screen
                                        navigate('/chat', { state: { messages } });
                                    }} 
                                    style={styles.closeBtn} 
                                    title="Expand to full screen"
                                    whileHover={{ scale: 1.1, color: '#a78bfa' }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Maximize2 size={16} />
                                </motion.button>
                                <motion.button 
                                    onClick={() => setIsOpen(false)} 
                                    style={styles.closeBtn}
                                    whileHover={{ scale: 1.1, color: '#ef4444' }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={18} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={styles.messagesArea}>
                            <AnimatePresence>
                                {messages.map((msg, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            ...styles.messageRow,
                                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        {msg.role === 'assistant' && (
                                            <motion.div 
                                                style={styles.avatar}
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <Bot size={14} color="#fff" />
                                            </motion.div>
                                        )}
                                        <motion.div
                                            style={{
                                                ...styles.bubble,
                                                background: msg.role === 'user'
                                                    ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                                                    : 'rgba(30, 30, 40, 0.8)',
                                                border: msg.role === 'assistant' ? '1px solid rgba(167, 139, 250, 0.2)' : 'none',
                                                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                boxShadow: msg.role === 'user' 
                                                    ? '0 4px 12px rgba(139, 92, 246, 0.3)' 
                                                    : '0 2px 8px rgba(0,0,0,0.2)',
                                            }}
                                            whileHover={{ y: -1 }}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ node, ...props }) => <p style={{ margin: 0, lineHeight: '1.6' }} {...props} />,
                                                        ul: ({ node, ...props }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }} {...props} />,
                                                        li: ({ node, ...props }) => <li style={{ margin: '0.2rem 0' }} {...props} />,
                                                        strong: ({ node, ...props }) => <strong style={{ color: '#a78bfa', fontWeight: 600 }} {...props} />,
                                                        code: ({ node, ...props }) => <code style={{ 
                                                            background: 'rgba(167, 139, 250, 0.1)', 
                                                            padding: '2px 6px', 
                                                            borderRadius: '4px',
                                                            fontSize: '0.85em' 
                                                        }} {...props} />
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            ) : (
                                                <p style={{ margin: 0, lineHeight: '1.6' }}>{msg.content}</p>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div 
                                        style={styles.messageRow}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div style={styles.avatar}>
                                            <Bot size={14} color="#fff" />
                                        </div>
                                        <div style={{ 
                                            ...styles.bubble, 
                                            background: 'rgba(30, 30, 40, 0.8)',
                                            border: '1px solid rgba(167, 139, 250, 0.2)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    <Loader size={14} color="#a78bfa" />
                                                </motion.div>
                                                <span style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Thinking...</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                autoFocus
                            />
                            <motion.button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                style={{
                                    ...styles.sendBtn,
                                    opacity: !input.trim() || isLoading ? 0.5 : 1,
                                    cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                                }}
                                whileHover={input.trim() && !isLoading ? { scale: 1.05, background: '#7c3aed' } : {}}
                                whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                            >
                                <Send size={16} />
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB (Floating Action Button) */}
            <motion.button
                whileHover={{ scale: 1.1, boxShadow: '0 8px 24px rgba(139, 92, 246, 0.6)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={styles.fab}
                title={isOpen ? "Close chat" : "Open chat"}
            >
                <motion.img 
                    src={logo} 
                    alt="Insightify" 
                    style={styles.fabLogo}
                    animate={isOpen ? { scale: 0.9 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                />
            </motion.button>
        </div>
    );
};

const styles = {
    fab: {
        width: '65px',
        height: '65px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '2px solid rgba(139, 92, 246, 0.3)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(139, 92, 246, 0.2)',
        zIndex: 10000,
        position: 'relative',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
    },
    fabLogo: {
        width: '36px',
        height: '36px',
        objectFit: 'contain',
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
    },
    chatWindow: {
        position: 'absolute',
        bottom: '75px',
        right: '0',
        width: '380px',
        height: '550px',
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: '20px',
        border: '1px solid rgba(167, 139, 250, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(167, 139, 250, 0.1)',
    },
    header: {
        padding: '18px',
        background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.9) 0%, rgba(15, 15, 25, 0.5) 100%)',
        borderBottom: '1px solid rgba(167, 139, 250, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(20px)',
    },
    headerIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
    },
    headerLogo: {
        width: '38px',
        height: '38px',
        objectFit: 'contain',
        filter: 'drop-shadow(0 2px 6px rgba(139, 92, 246, 0.5))',
    },
    closeBtn: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        padding: '6px',
        display: 'flex',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
    },
    messagesArea: {
        flex: 1,
        padding: '18px',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    messageRow: {
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
        width: '100%',
    },
    avatar: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
    },
    bubble: {
        padding: '12px 16px',
        maxWidth: '80%',
        color: '#e2e8f0',
        fontSize: '0.9rem',
        lineHeight: '1.6',
        wordWrap: 'break-word',
        transition: 'all 0.2s ease',
    },
    inputArea: {
        padding: '14px',
        borderTop: '1px solid rgba(167, 139, 250, 0.1)',
        background: 'linear-gradient(180deg, transparent 0%, rgba(15, 15, 25, 0.5) 100%)',
        display: 'flex',
        gap: '10px',
    },
    input: {
        flex: 1,
        padding: '10px 14px',
        borderRadius: '12px',
        border: '1px solid rgba(167, 139, 250, 0.2)',
        background: 'rgba(25, 25, 35, 0.8)',
        color: 'white',
        outline: 'none',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
    },
    sendBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        border: 'none',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
        transition: 'all 0.2s ease',
    },
};

export default ChatWidget;
