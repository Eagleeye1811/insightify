import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
    const { user } = useAuth(); // Get authenticated user
    const location = useLocation();
    
    // Initialize messages from location state (if coming from popup) or with default message
    const initialMessages = location.state?.messages || [
        {
            role: 'assistant',
            content: "Hello! I'm your Insightify AI Assistant. I can answer questions about your app reviews and insights. How can I help you today?",
        },
    ];
    
    const [messages, setMessages] = useState(initialMessages);
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
            // Get user ID from AuthContext
            const userId = user?.uid || 'anonymous';
            
            console.log('Sending chat request with userId:', userId); // Debug log

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
            
            // Try to parse error response
            let errorMessage = "I apologize, but I'm having trouble connecting to the server right now. Please make sure the backend server is running on port 5001 and try again.\n\nIn the meantime, I can still help with general questions about app analytics!";
            
            try {
                const errorData = await error.response?.json();
                if (errorData?.error === 'rate_limit') {
                    errorMessage = "⏰ I'm currently experiencing high demand and have reached my rate limit. Please wait a minute and try again.\n\nI can still help with general advice! What would you like to know?";
                }
            } catch (parseError) {
                // Use default error message
            }
            
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

    return (
        <div className="chatbot-page">
            {/* Animated Background */}
            <div className="chatbot-background">
                <div className="chatbot-background-gradient" />
                <div className="chatbot-background-pattern" />
            </div>
            
            <div className="chatbot-container">
                {/* Header */}
                <header className="chatbot-header">
                    <motion.div 
                        className="chatbot-header-content"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="chatbot-header-text">
                            <h2 className="chatbot-header-title">
                                Insightify Intelligence
                            </h2>
                            <p className="chatbot-header-subtitle">
                                AI-powered insights at your fingertips
                            </p>
                        </div>
                    </motion.div>
                </header>

                {/* Messages Area */}
                <div className="chatbot-messages-area">
                    <AnimatePresence>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                className={`chatbot-message-row ${msg.role}`}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="chatbot-avatar assistant">
                                        <Bot size={22} color="#fff" />
                                    </div>
                                )}

                                <div className={`chatbot-bubble ${msg.role}`}>
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <p style={{ margin: '0.5em 0', lineHeight: '1.7' }} {...props} />,
                                                ul: ({ node, ...props }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...props} />,
                                                ol: ({ node, ...props }) => <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...props} />,
                                                li: ({ node, ...props }) => <li style={{ margin: '0.3rem 0' }} {...props} />,
                                                strong: ({ node, ...props }) => <strong style={{ color: '#a78bfa', fontWeight: 600 }} {...props} />,
                                                em: ({ node, ...props }) => <em style={{ color: '#c4b5fd' }} {...props} />,
                                                code: ({ node, inline, ...props }) => 
                                                    inline ? (
                                                        <code style={{ 
                                                            background: 'rgba(167, 139, 250, 0.15)', 
                                                            padding: '2px 8px', 
                                                            borderRadius: '5px',
                                                            fontSize: '0.9em',
                                                            color: '#e9d5ff',
                                                            fontFamily: 'monospace'
                                                        }} {...props} />
                                                    ) : (
                                                        <code style={{ 
                                                            display: 'block',
                                                            background: 'rgba(167, 139, 250, 0.1)', 
                                                            padding: '12px', 
                                                            borderRadius: '8px',
                                                            fontSize: '0.9em',
                                                            color: '#e9d5ff',
                                                            fontFamily: 'monospace',
                                                            overflowX: 'auto',
                                                            margin: '0.5rem 0'
                                                        }} {...props} />
                                                    ),
                                                h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.5em', marginTop: '1em', marginBottom: '0.5em', color: '#a78bfa' }} {...props} />,
                                                h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.3em', marginTop: '0.8em', marginBottom: '0.4em', color: '#a78bfa' }} {...props} />,
                                                h3: ({ node, ...props }) => <h3 style={{ fontSize: '1.1em', marginTop: '0.6em', marginBottom: '0.3em', color: '#c4b5fd' }} {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote style={{ 
                                                    borderLeft: '3px solid #a78bfa', 
                                                    paddingLeft: '1rem', 
                                                    margin: '0.5rem 0',
                                                    color: '#c4b5fd',
                                                    fontStyle: 'italic'
                                                }} {...props} />,
                                                hr: ({ node, ...props }) => <hr style={{ 
                                                    border: 'none', 
                                                    borderTop: '1px solid rgba(167, 139, 250, 0.2)', 
                                                    margin: '1rem 0' 
                                                }} {...props} />,
                                                a: ({ node, ...props }) => <a style={{ 
                                                    color: '#a78bfa', 
                                                    textDecoration: 'underline' 
                                                }} {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    ) : (
                                        <p style={{ margin: 0, lineHeight: '1.6' }}>{msg.content}</p>
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="chatbot-avatar user">
                                        <User size={22} color="#fff" />
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {isLoading && (
                            <motion.div
                                className="chatbot-message-row assistant"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="chatbot-avatar assistant">
                                    <Bot size={22} color="#fff" />
                                </div>
                                <div className="chatbot-bubble assistant">
                                    <div className="chatbot-loading">
                                        <Loader className="chatbot-loading-spinner" size={16} color="#a78bfa" />
                                        <span className="chatbot-loading-text">Analyzing insights...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <motion.div 
                    className="chatbot-input-area"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <form onSubmit={handleSubmit} className="chatbot-form">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about your app reviews..."
                            className="chatbot-input"
                            disabled={isLoading}
                            autoFocus
                        />
                        <motion.button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="chatbot-send-button"
                            whileHover={input.trim() && !isLoading ? { scale: 1.05, rotate: 5 } : {}}
                            whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                            transition={{ duration: 0.2 }}
                        >
                            <Send size={20} />
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Chatbot;
