import React, { useState, useEffect, useRef } from 'react';
import { InteractiveRobotSpline } from '../components/InteractiveRobotSpline';
import { Mic, MicOff, Trash2 } from 'lucide-react';
import './VoiceAgent.css';
import './VoiceAgentChat.css';

const VoiceAgentFree = () => {
    const [isListening, setIsListening] = useState(false);
    const [statusText, setStatusText] = useState("Ready to talk");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentTyping, setCurrentTyping] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [conversationSummary, setConversationSummary] = useState('');
    
    const recognitionRef = useRef(null);
    const wsRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const typingIntervalRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setStatusText("Speech recognition not supported");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            console.log('🎤 [SPEECH RECOGNITION] Transcription complete:', transcript);
            
            // Check for end conversation commands
            const lowerTranscript = transcript.toLowerCase().trim();
            const endCommands = [
                'cancel',
                'cancel conversation',
                'end conversation',
                'stop conversation',
                'exit',
                'goodbye',
                'bye',
                'end chat',
                'stop chat'
            ];
            
            if (endCommands.some(cmd => lowerTranscript.includes(cmd))) {
                console.log('🎯 [VOICE COMMAND] End conversation detected:', transcript);
                setMessages(prev => [...prev, { sender: 'User', text: transcript }]);
                setTimeout(() => {
                    endConversation();
                }, 1000); // Small delay to show the message before clearing
                return;
            }
            
            // Add user message
            setMessages(prev => [...prev, { sender: 'User', text: transcript }]);
            setStatusText("Processing...");
            
            // Send to server
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                console.log('📤 [WEBSOCKET] Sending transcription to server...');
                wsRef.current.send(JSON.stringify({ text: transcript }));
                console.log('✅ [WEBSOCKET] Transcription sent');
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error('❌ [SPEECH RECOGNITION] Error:', event.error);
            setStatusText(`Error: ${event.error}`);
        };

        recognitionRef.current.onend = () => {
            if (isListening) {
                console.log('🔄 [SPEECH RECOGNITION] Restarting listener...');
                recognitionRef.current.start();
            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening]);

    const startListening = () => {
        console.log('🔌 [WEBSOCKET] Connecting to server...');
        const ws = new WebSocket('ws://localhost:8000/ws/voice-agent');
        
        ws.onopen = () => {
            console.log('✅ [WEBSOCKET] Connected to server');
            console.log('🎤 [SPEECH RECOGNITION] Starting microphone...');
            setIsListening(true);
            setStatusText("Listening...");
            recognitionRef.current.start();
            console.log('✅ [SPEECH RECOGNITION] Microphone active - speak now!');
        };

        ws.onmessage = (event) => {
            console.log('📥 [WEBSOCKET] Received response from server');
            const data = JSON.parse(event.data);
            const response = data.response;
            
            console.log('🤖 [AI RESPONSE]:', response);
            setStatusText("Speaking...");
            
            // Typewriter effect for AI response
            typewriterEffect(response);
            
            console.log('🔊 [SPEECH SYNTHESIS] Starting to speak response...');
            speakText(response);
        };

        ws.onerror = (error) => {
            console.error('❌ [WEBSOCKET] Connection error:', error);
            setStatusText("Connection error");
        };

        ws.onclose = () => {
            console.log('👋 [WEBSOCKET] Disconnected from server');
            stopListening();
        };

        wsRef.current = ws;
    };

    const stopListening = () => {
        console.log('⏹️  [SYSTEM] Stopping voice agent...');
        setIsListening(false);
        setStatusText("Ready to talk");
        
        if (recognitionRef.current) {
            console.log('🎤 [SPEECH RECOGNITION] Stopping microphone');
            recognitionRef.current.stop();
        }
        
        if (wsRef.current) {
            console.log('🔌 [WEBSOCKET] Closing connection');
            wsRef.current.close();
        }

        console.log('🔊 [SPEECH SYNTHESIS] Canceling any ongoing speech');
        synthRef.current.cancel();
        console.log('✅ [SYSTEM] Voice agent stopped');
    };

    const typewriterEffect = (text) => {
        setIsTyping(true);
        setCurrentTyping('');
        let index = 0;
        
        // Clear any existing typing interval
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
        }
        
        typingIntervalRef.current = setInterval(() => {
            if (index < text.length) {
                setCurrentTyping(prev => prev + text[index]);
                index++;
            } else {
                clearInterval(typingIntervalRef.current);
                setIsTyping(false);
                // Add complete message to history
                setMessages(prev => [...prev, { sender: 'Insightify', text: text }]);
                setCurrentTyping('');
            }
        }, 30); // Speed of typing (30ms per character)
    };

    const speakText = (text) => {
        console.log('🔊 [SPEECH SYNTHESIS] Preparing to speak...');
        synthRef.current.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Find a good voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
        if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log('🔊 [SPEECH SYNTHESIS] Using voice:', preferredVoice.name);
        }

        utterance.onstart = () => {
            console.log('🔊 [SPEECH SYNTHESIS] Speaking started');
            setIsSpeaking(true);
        };
        
        utterance.onend = () => {
            console.log('✅ [SPEECH SYNTHESIS] Speaking completed');
            console.log('⏳ [SYSTEM] Ready for next input\n');
            setIsSpeaking(false);
        };
        
        synthRef.current.speak(utterance);
        console.log('🔊 [SPEECH SYNTHESIS] Audio queued for playback');
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const generateSummary = () => {
        if (messages.length === 0) return;
        
        const timestamp = new Date().toLocaleString();
        const messageCount = messages.length;
        const userMessages = messages.filter(m => m.sender === 'User').length;
        const aiMessages = messages.filter(m => m.sender === 'Insightify').length;
        
        let summary = `# Voice Agent Conversation Summary\n\n`;
        summary += `**Date:** ${timestamp}\n`;
        summary += `**Total Messages:** ${messageCount} (${userMessages} from you, ${aiMessages} from Insightify)\n\n`;
        summary += `---\n\n`;
        
        messages.forEach((msg, index) => {
            summary += `**${msg.sender}:** ${msg.text}\n\n`;
        });
        
        summary += `---\n\n`;
        summary += `*Generated by Insightify Voice Agent*`;
        
        return summary;
    };

    const downloadSummary = () => {
        const summary = conversationSummary;
        const blob = new Blob([summary], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('📥 [SYSTEM] Conversation downloaded');
    };


    const endConversation = () => {
        console.log('🗑️  [SYSTEM] Ending conversation...');
        
        // Stop listening and speaking
        stopListening();
        
        // Generate summary if there are messages
        if (messages.length > 0) {
            const summary = generateSummary();
            setConversationSummary(summary);
            setShowSummary(true);
        } else {
            // If no messages, just reset
            resetConversation();
        }
    };

    const resetConversation = () => {
        setMessages([]);
        setCurrentTyping('');
        setIsTyping(false);
        setShowSummary(false);
        setConversationSummary('');
        setStatusText("Conversation ended. Ready to start fresh!");
        
        setTimeout(() => {
            setStatusText("Ready to talk");
        }, 2000);
        
        console.log('✅ [SYSTEM] Conversation ended and cleared');
    };

    // Scroll to bottom when new message (only within chat container)
    useEffect(() => {
        if (chatContainerRef.current) {
            const chatMessages = chatContainerRef.current.querySelector('.chat-messages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }, [messages, currentTyping]);

    useEffect(() => {
        return () => {
            stopListening();
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="voice-agent-container">
            {/* Content on the left side */}
            <div className="content-overlay">
                {/* Status & Waveform */}
                <div style={{ marginBottom: '1.5rem', minHeight: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 className="agent-status text-gradient" style={{ fontSize: '0.9rem', margin: 0 }}>
                        {statusText}
                    </h2>
                    
                    {(isListening || isSpeaking) && (
                        <div className="waveform-container" style={{ margin: 0 }}>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </div>
                    )}
                </div>

                {/* Mic Button */}
                <div className="control-bar" style={{ marginBottom: '1rem', gap: '1rem' }}>
                    <button
                        className={`btn-mic ${isListening ? 'active' : ''}`}
                        onClick={toggleListening}
                    >
                        {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                    </button>
                    
                    {messages.length > 0 && (
                        <button
                            className="btn-end-conversation"
                            onClick={endConversation}
                            title="End conversation and clear chat"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>

                <p style={{ marginBottom: '2rem', color: '#cbd5e1', fontSize: '0.9rem', textAlign: 'center' }}>
                    {isListening ? "Speak naturally - I'm listening!" : "Click to start conversation"}
                </p>
                
                {isListening && (
                    <p style={{ marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center' }}>
                        Say "cancel" or "end conversation" to stop
                    </p>
                )}

                {/* Chat Container */}
                <div className="chat-container" ref={chatContainerRef}>
                    <div className="chat-messages">
                        {messages.length === 0 && !isListening && (
                            <div style={{ 
                                textAlign: 'center', 
                                color: '#94a3b8', 
                                marginTop: '3rem',
                                fontSize: '0.9rem'
                            }}>
                                Click the microphone to start your conversation...
                            </div>
                        )}
                        
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'User' ? 'user-message' : 'ai-message'}`}>
                                <div className="message-sender">{msg.sender}:</div>
                                <div className="message-text">{msg.text}</div>
                            </div>
                        ))}
                        
                        {/* Typing indicator */}
                        {isTyping && currentTyping && (
                            <div className="message ai-message typing">
                                <div className="message-sender">Insightify:</div>
                                <div className="message-text">
                                    {currentTyping}
                                    <span className="typing-cursor">|</span>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Robot on the right */}
            <div className="spline-background" style={{ paddingTop: 0, marginTop: 0 }}>
                <InteractiveRobotSpline
                    scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
                    className="w-full h-full"
                />
            </div>

            {/* Summary Modal */}
            {showSummary && (
                <div className="summary-modal-overlay" onClick={resetConversation}>
                    <div className="summary-modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
                            Conversation Summary
                        </h2>
                        
                        <div className="summary-content">
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                {conversationSummary}
                            </pre>
                        </div>

                        <div className="summary-actions">
                            <button 
                                className="btn-summary download"
                                onClick={downloadSummary}
                            >
                                Download
                            </button>
                            <button 
                                className="btn-summary close"
                                onClick={resetConversation}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAgentFree;
