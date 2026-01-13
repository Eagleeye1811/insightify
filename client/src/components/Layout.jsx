import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            <div className="main-wrapper">
                <Navbar />
                <main className="page-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '80px' }}>
                    {children}
                </main>
                <Footer />
                <ChatWidget />
            </div>
        </div>
    );
};

export default Layout;
