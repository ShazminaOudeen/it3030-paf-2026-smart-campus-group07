import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ unreadCount }) => {
    const [shake, setShake] = useState(false);
    const navigate = useNavigate();

    const handleClick = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        navigate('/notifications');
    };

    return (
        <button
            onClick={handleClick}
            className={`relative p-2 rounded-full hover:bg-gray-100 transition ${shake ? 'animate-bounce' : ''}`}
        >
            <span className="text-2xl">🔔</span>
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationBell;