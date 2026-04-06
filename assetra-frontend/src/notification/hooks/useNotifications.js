import { useState, useEffect, useCallback } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../api/notificationsApi';

const useNotifications = (userId, token) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!userId || !token) return;
        setLoading(true);
        try {
            const res = await getNotifications(userId, token);
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId, token]);

    const fetchUnreadCount = useCallback(async () => {
        if (!userId || !token) return;
        try {
            const res = await getUnreadCount(userId, token);
            setUnreadCount(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [userId, token]);

    const handleMarkAsRead = async (id) => {
        await markAsRead(id, token);
        fetchNotifications();
        fetchUnreadCount();
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead(userId, token);
        fetchNotifications();
        fetchUnreadCount();
    };

    const handleDelete = async (id) => {
        await deleteNotification(id, token);
        fetchNotifications();
        fetchUnreadCount();
    };

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications, fetchUnreadCount]);

    return { notifications, unreadCount, loading, handleMarkAsRead, handleMarkAllAsRead, handleDelete, fetchNotifications };
};

export default useNotifications;