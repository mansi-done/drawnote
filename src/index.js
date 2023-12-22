import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ConfigProvider } from "antd"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ConfigProvider
        theme={{
            token: {
                // Seed Token
                colorPrimary: '#B27CE6',
                borderRadius: 2,

                // Alias Token
                colorBgContainer: '#8b34dc',
            },
        }}
    >
        <App />
    </ConfigProvider>
);

