import React, { useState } from 'react';
import useNotifications from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem';

const FILTERS = ['ALL', 'BOOKING_APPROVED', 'BOOKING_REJECTED', 'TICKET_UPDATED', 'COMMENT_ADDED'];

const NotificationsPage = ({ userId, token }) => {
    const { notifications, unreadCount, loading, handleMarkAsRead, handleMarkAllAsRead, handleDelete } = useNotifications(userId, token);
    const [filter, setFilter] = useState('ALL');

    const filtered = filter === 'ALL' ? notifications : notifications.filter(n => n.type === filter);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">🔔 Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {f.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading notifications...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-5xl mb-4">🔕</p>
                    <p className="text-gray-400">No notifications found</p>
                </div>
            ) : (
                filtered.map(n => (
                    <NotificationItem
                        key={n.id}
                        notification={n}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </div>
    );
};

export default NotificationsPage;