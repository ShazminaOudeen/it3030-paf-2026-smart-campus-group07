import React from 'react';

const typeColors = {
    BOOKING_APPROVED: 'bg-green-100 border-green-400 text-green-800',
    BOOKING_REJECTED: 'bg-red-100 border-red-400 text-red-800',
    TICKET_UPDATED: 'bg-blue-100 border-blue-400 text-blue-800',
    COMMENT_ADDED: 'bg-yellow-100 border-yellow-400 text-yellow-800',
};

const typeIcons = {
    BOOKING_APPROVED: '✅',
    BOOKING_REJECTED: '❌',
    TICKET_UPDATED: '🔧',
    COMMENT_ADDED: '💬',
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
    const colorClass = typeColors[notification.type] || 'bg-gray-100 border-gray-400 text-gray-800';
    const icon = typeIcons[notification.type] || '🔔';

    return (
        <div className={`border-l-4 p-4 rounded-lg mb-3 shadow-sm transition-all duration-200 ${colorClass} ${!notification.isRead ? 'opacity-100' : 'opacity-60'}`}>
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                        <p className="font-semibold text-sm">{notification.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm mt-1">{notification.message}</p>
                        <p className="text-xs mt-2 opacity-70">
                            {new Date(notification.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                    {!notification.isRead && (
                        <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-xs bg-white px-2 py-1 rounded shadow hover:shadow-md transition"
                        >
                            Mark read
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(notification.id)}
                        className="text-xs bg-white px-2 py-1 rounded shadow hover:shadow-md transition text-red-500"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;