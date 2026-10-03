import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, Filter, AlertTriangle, UserCheck } from 'lucide-react';

export const NotificationsCenterView = () => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead, navigateTo } = useApp();
  const [filterUnread, setFilterUnread] = useState(false);

  const userNotifications = (notifications || []).filter(n => 
    !n.userId || 
    String(n.userId) === String(currentUser?.id) || 
    (n.userEmail && currentUser?.email && n.userEmail.toLowerCase() === currentUser.email.toLowerCase())
  );

  const displayedNotifs = filterUnread ? userNotifications.filter(n => !n.read) : userNotifications;

  return (
    <div className="p-6 space-y-4 max-w-[1200px] mx-auto">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Notification & Activity Center</h1>
            <p className="text-xs text-slate-500">Track task assignments, review requests, bug logs, and deadline reminders</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
              filterUnread ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {filterUnread ? 'Showing Unread' : 'Show Only Unread'}
          </button>
          <button
            onClick={markAllNotificationsRead}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {displayedNotifs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No notifications found</div>
        ) : (
          displayedNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.linkTaskId) navigateTo('task_details', n.linkTaskId);
              }}
              className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between text-xs ${
                !n.read ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <p className="text-slate-600 leading-snug">{n.message}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
