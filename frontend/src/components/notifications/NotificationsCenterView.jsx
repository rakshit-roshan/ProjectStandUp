import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, Filter, AlertTriangle, UserCheck } from 'lucide-react';

export const NotificationsCenterView = () => {
  const { currentUser, notifications, userNotifications: contextUserNotifs, markNotificationRead, markAllNotificationsRead, navigateTo } = useApp();
  const [filterUnread, setFilterUnread] = useState(false);

  const userNotifications = contextUserNotifs || (notifications || []).filter(n => {
    if (!currentUser || !n) return false;
    const uid = String(currentUser.id || '');
    const email = (currentUser.email || '').toLowerCase().trim();
    const nUid = n.userId !== undefined && n.userId !== null ? String(n.userId).trim() : '';
    const nEmail = n.userEmail ? String(n.userEmail).toLowerCase().trim() : '';
    return (uid && nUid && (nUid === uid || nUid.split(',').map(s => s.trim()).includes(uid))) ||
           (email && nEmail && (nEmail === email || nEmail.split(',').map(s => s.trim()).includes(email)));
  });

  const displayedNotifs = filterUnread ? userNotifications.filter(n => !(n.read || n.isRead)) : userNotifications;

  return (
    <div className="p-6 space-y-4 max-w-[1200px] mx-auto">
      <div id="notifications-center-header" className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
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

      <div id="notifications-list" className="bg-white rounded-lg border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
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
                  {!(n.read || n.isRead) && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <p className="text-slate-600 leading-snug">{n.message}</p>
                {(n.reporterName || n.reporter_name) && (
                  <p className="text-[10px] text-slate-400 font-medium">
                    From: <span className="text-slate-500">{n.reporterName || n.reporter_name}</span>
                  </p>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
