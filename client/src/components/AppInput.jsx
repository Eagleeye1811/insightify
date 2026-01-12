import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppInput = () => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleAnalyze = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 800);
    };

    // Inline styles for speed and containment
    const styles = {
        form: {
            position: 'relative',
            maxWidth: '42rem',
            margin: '0 auto',
            width: '100%'
        },
        glow: {
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #2563eb, #9333ea)',
            borderRadius: '999px',
            filter: 'blur(12px)',
            opacity: 0.25,
            transition: 'opacity 0.5s'
        },
        container: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '999px',
            padding: '0.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        },
        input: {
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#000000',
            padding: '0.75rem 1rem',
            fontSize: '1.125rem',
            outline: 'none'
        },
        button: {
            background: '#000000',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '999px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'transform 0.1s'
        }
    };

    return (
        <form onSubmit={handleAnalyze} style={styles.form}>
            <div style={styles.glow}></div>
            <div style={styles.container}>
                <Search color="#000000" size={24} style={{ marginLeft: '1rem' }} />
                <input
                    type="text"
                    placeholder="Paste Play Store Link or App Name..."
                    style={styles.input}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    style={styles.button}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
                </button>
            </div>
        </form>
    );
};

export default AppInput;
