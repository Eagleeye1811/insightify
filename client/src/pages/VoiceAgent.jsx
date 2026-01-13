import React, { useState, useEffect } from 'react';
import { InteractiveRobotSpline } from '../components/InteractiveRobotSpline';
import { Mic, MicOff, MessageSquare, TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import './VoiceAgent.css';

const VoiceAgent = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [statusText, setStatusText] = useState("Ready to connect");

    // Refs for audio and websocket
    const audioContextRef = React.useRef(null);
    const wsRef = React.useRef(null);
    const streamRef = React.useRef(null);
    const workletNodeRef = React.useRef(null);
    const sourceNodeRef = React.useRef(null);

    // Initial audio input setup
    const startAudio = async () => {
        try {
            setStatusText("Requesting microphone...");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    autoGainControl: true,
                    noiseSuppression: true
                }
            });
            streamRef.current = stream;

            setStatusText("Connecting to server...");
            // Connect WebSocket
            const ws = new WebSocket('ws://localhost:8000/ws/agent');
            ws.binaryType = 'arraybuffer';
            wsRef.current = ws;

            ws.onopen = async () => {
                console.log("WebSocket connected");
                setStatusText("Listening...");
                setIsConnected(true);

                // Initialize Audio Context
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

                // Create Source
                sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);

                // Create Worklet Node
                workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');

                // Handle data from audio processor (mic input)
                workletNodeRef.current.port.onmessage = (event) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(event.data);
                    }
                };

                sourceNodeRef.current.connect(workletNodeRef.current);
                workletNodeRef.current.connect(audioContextRef.current.destination); // Connect to dest to keep alive? Usually not needed if not playing back self.
                // Actually, connecting to destination might cause feedback if we are not careful. 
                // In worklet, we didn't pass input to output, so it should be fine.
            };

            ws.onmessage = async (event) => {
                // Receive audio from server (Gemini response)
                playAudioChunk(event.data);
            };

            ws.onclose = (event) => {
                console.log("WebSocket disconnected", event);
                if (event.code === 1011 || event.reason) {
                    setStatusText(`Error: ${event.reason || "Connection closed error"}`);
                } else {
                    stopAudio();
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                setStatusText("Connection Error");
            };

        } catch (error) {
            console.error("Error starting audio:", error);
            setStatusText("Error Requesting Mic");
        }
    };

    const stopAudio = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        setIsConnected(false);
        setStatusText("Ready to connect");
    };

    const playAudioChunk = (data) => {
        // Simple playback using decodeAudioData (might have latency)
        // For lower latency, we should use a proper AudioWorklet or ScriptProcessor to queue PCM data.
        // But since we receive chunks, let's try a simple buffer queue or just decode if it's WAV/MP3. 
        // Gemini often sends PCM. If PCM, we need to create buffer manually.

        // Assuming Gemini sends raw PCM 16-bit 24kHz (default usually) or 16kHz?
        // Our client asked for 16kHz.
        // The Gemini Live API spec says raw PCM. 
        // Let's assume we receive raw PCM 16-bit Little Endian.

        if (!audioContextRef.current) return;

        const int16Array = new Int16Array(data);
        const float32Array = new Float32Array(int16Array.length);

        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
        }

        const buffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000); // Gemini usually 24kHz out
        buffer.getChannelData(0).set(float32Array);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start();
    };

    const toggleConnection = () => {
        if (isConnected) {
            stopAudio();
        } else {
            startAudio();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopAudio();
    }, []);

    return (
        <div className="voice-agent-container">
            {/* Background Layer: 3D Robot */}
            <div className="spline-background">
                <InteractiveRobotSpline
                    scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
                    className="w-full h-full"
                />
            </div>

            {/* Overlay Layer: UI Controls */}
            <div className="content-overlay">

                {/* Top Badge */}
                <div className="mentor-badge">
                    <Briefcase size={14} />
                    <span>Senior Play Store App Growth Mentor</span>
                </div>

                {/* Live Status Indicator */}
                <div className={`live-indicator ${isConnected ? 'on-air' : ''}`}>
                    <div className="recording-dot"></div>
                    <span>{isConnected ? "LIVE CONNECTION" : "OFFLINE"}</span>
                </div>

                {/* Status Text */}
                <h2 className="agent-status text-gradient">
                    {statusText}
                </h2>

                {/* Audio Waveform Visualization */}
                {isConnected && (
                    <div className="waveform-container">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                )}

                {/* Control Bar */}
                <div className="control-bar">
                    <button
                        className={`btn-mic ${isConnected ? 'active' : ''}`}
                        onClick={toggleConnection}
                    >
                        {isConnected ? <MicOff size={32} /> : <Mic size={32} />}
                    </button>
                </div>

                <p style={{ marginTop: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {isConnected ? "Tap to disconnect" : "Tap to start conversation"}
                </p>
            </div>
        </div>
    );
};

export default VoiceAgent;
