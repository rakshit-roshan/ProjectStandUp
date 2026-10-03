import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  File,
  X,
  Users,
  Check,
  CheckCheck,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
  Download,
  Phone,
  Video,
  Info,
  Filter,
  Camera,
  UserPlus,
  ShieldCheck,
  Trash2,
  Ban
} from 'lucide-react';

export const TeamChatView = () => {
  const {
    currentUser,
    users,
    currentProject,
    getProjectMembers,
    chatMessages = [],
    chatChannels = [],
    sendChatMessage,
    deleteChatMessage,
    createChatChannel,
    markChatAsRead
  } = useApp();

  const teamMembers = getProjectMembers(currentProject);

  const otherUsers = users.filter(u => u.id !== currentUser?.id);

  // Active Chat State: dynamically select first contact/channel or null
  const [activeChatId, setActiveChatId] = useState(() => {
    if (chatChannels && chatChannels.length > 0) return chatChannels[0].id;
    if (otherUsers && otherUsers.length > 0) return otherUsers[0].id;
    return null;
  });
  const [chatType, setChatType] = useState(() => {
    if (chatChannels && chatChannels.length > 0) return 'CHANNEL';
    return 'DIRECT';
  });

  const [messageInput, setMessageInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'UNREAD', 'GROUPS'
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);

  // WhatsApp Style Group Creation Modal States (Step 1: Select Members, Step 2: Group Details)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupStep, setGroupStep] = useState(1);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom when new message arrives or active chat changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeChatId]);

  // Auto mark messages as read when viewing active direct chat
  useEffect(() => {
    if (chatType === 'DIRECT' && activeChatId && currentUser?.id && markChatAsRead) {
      const hasUnread = chatMessages.some(
        m => String(m.senderId) === String(activeChatId) &&
             String(m.recipientId) === String(currentUser.id) &&
             !m.isRead
      );
      if (hasUnread) {
        markChatAsRead(activeChatId);
      }
    }
  }, [activeChatId, chatType, chatMessages, currentUser?.id, markChatAsRead]);

  // Active Chat Target Resolution (Channel or DM User)
  const activeChannel = chatChannels.find(c => c.id === activeChatId);
  const activeUser = users.find(u => String(u.id) === String(activeChatId) || u.email === activeChatId);

  const activeTitle = chatType === 'CHANNEL'
    ? (activeChannel?.name || 'general')
    : (activeUser?.name || 'Team Member');

  const isUserOnline = (u) => {
    if (!u) return false;
    if (String(u.id) === String(currentUser?.id) || u.email?.toLowerCase() === currentUser?.email?.toLowerCase()) return true;
    return u.status === 'Online' || u.status === 'online' || u.isOnline === true;
  };

  // Subtitle: For groups, list member names; for DMs, show real online/offline status
  const activeSubtitle = chatType === 'CHANNEL'
    ? (activeChannel?.description || 'Group Channel • Click for info')
    : (isUserOnline(activeUser) ? 'Online' : 'Offline • Last seen recently');

  // Filter messages for current chat session
  const currentMessages = chatMessages.filter(msg => {
    if (chatType === 'CHANNEL') {
      return msg.channelId === activeChatId;
    } else {
      return (
        (String(msg.senderId) === String(currentUser?.id) && String(msg.recipientId) === String(activeChatId)) ||
        (String(msg.senderId) === String(activeChatId) && String(msg.recipientId) === String(currentUser?.id))
      );
    }
  });

  // Handle Real File Upload Selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileObj = {
          id: `FILE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          type: file.type,
          url: event.target.result
        };
        setPendingFiles(prev => [...prev, fileObj]);
      };
      reader.readAsDataURL(file);
    });
    setShowAttachMenu(false);
  };

  const removePendingFile = (id) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id));
  };

  // Handle Message Submit
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() && pendingFiles.length === 0) return;

    sendChatMessage({
      senderId: currentUser?.id || 'USR-101',
      senderName: currentUser?.name || 'Manager',
      senderAvatar: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'M')}&background=00a884&color=fff`,
      recipientId: chatType === 'DIRECT' ? activeChatId : null,
      channelId: chatType === 'CHANNEL' ? activeChatId : null,
      content: messageInput,
      attachments: pendingFiles
    });

    setMessageInput('');
    setPendingFiles([]);
  };

  // Group Member Toggle in Step 1
  const toggleSelectMember = (userId) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  // Handle Complete Group Creation
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const channel = createChatChannel({
      name: newGroupName.trim(),
      description: newGroupDesc,
      memberIds: [currentUser?.id, ...selectedMemberIds].join(',')
    });

    // Reset Group Modal State
    setIsGroupModalOpen(false);
    setGroupStep(1);
    setSelectedMemberIds([]);
    setNewGroupName('');
    setNewGroupDesc('');

    if (channel) {
      setActiveChatId(channel.id);
      setChatType('CHANNEL');
    }
  };

  // Collect Shared Files in Current Chat
  const sharedFiles = currentMessages.flatMap(m => m.attachments || []);

  return (
    <div className="h-[calc(100vh-8.5rem)] w-full bg-[#f0f2f5] flex overflow-hidden rounded-xl border border-slate-300/80 shadow-md select-none font-sans">
      {/* Hidden File Input for Real Files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* LEFT SIDEBAR: WHATSAPP CHAT LIST PANE */}
      <div className="w-full md:w-[380px] lg:w-[420px] bg-white border-r border-slate-200 flex flex-col shrink-0 h-full">
        {/* Top Header Bar */}
        <div className="h-16 px-4 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <img
              src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=00a884&color=fff`}
              alt={currentUser?.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-300 ring-2 ring-emerald-500/20"
            />
            <div>
              <div className="text-sm font-bold text-slate-900 leading-snug truncate max-w-[140px]">
                {currentUser?.name || 'Workspace User'}
              </div>
              <div className="text-[11px] text-[#008f70] font-medium">Online</div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setIsGroupModalOpen(true);
                setGroupStep(1);
              }}
              className="p-2.5 hover:bg-slate-200/80 rounded-full text-slate-600 transition-colors"
              title="New Group Chat"
            >
              <Users className="w-5 h-5 text-[#00a884]" />
            </button>
            <button
              onClick={() => {
                setIsGroupModalOpen(true);
                setGroupStep(1);
              }}
              className="p-2.5 hover:bg-slate-200/80 rounded-full text-slate-600 transition-colors"
              title="New Chat / Contact"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-2.5 bg-white border-b border-slate-100 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f0f2f5] border-none rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#00a884] placeholder-slate-500 font-sans"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 pt-0.5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                filterType === 'ALL' ? 'bg-[#e7fce3] text-[#008f70]' : 'bg-[#f0f2f5] text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('GROUPS')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                filterType === 'GROUPS' ? 'bg-[#e7fce3] text-[#008f70]' : 'bg-[#f0f2f5] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
          {/* GROUP CHANNELS */}
          {filterType !== 'UNREAD' && (
            <div>
              <div className="px-4 py-1.5 bg-[#f0f2f5]/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Group Channels ({chatChannels.length})
              </div>
              {chatChannels
                .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(channel => {
                  const isSelected = String(activeChatId) === String(channel.id) && chatType === 'CHANNEL';
                  const channelMsgs = chatMessages.filter(m => m.channelId === channel.id);
                  const lastMsg = channelMsgs[channelMsgs.length - 1];

                  return (
                    <div
                      key={channel.id}
                      onClick={() => {
                        setActiveChatId(channel.id);
                        setChatType('CHANNEL');
                      }}
                      className={`px-3.5 py-3 flex items-center space-x-3 cursor-pointer transition-all border-l-4 ${
                        isSelected ? 'bg-[#e7fce3] border-[#00a884]' : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-[#00a884] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-base">
                        #
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">#{channel.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {lastMsg?.timestamp || ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {lastMsg ? (
                            Boolean(lastMsg.isDeleted || lastMsg.deleted) ? (
                              <span className="italic text-slate-400 flex items-center space-x-1">
                                <Ban className="w-3 h-3 text-slate-400 shrink-0 mr-1 inline" />
                                <span>{String(lastMsg.senderId) === String(currentUser?.id) ? 'You deleted this message' : 'This message was deleted'}</span>
                              </span>
                            ) : (
                              `${lastMsg.senderName}: ${lastMsg.content || 'Attachment'}`
                            )
                          ) : channel.description || 'Group Chat'}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* DIRECT MESSAGES (CONTACTS) */}
          <div>
            <div className="px-4 py-1.5 bg-[#f0f2f5]/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Direct Chats ({users.filter(u => u.id !== currentUser?.id).length})
            </div>
            {users
              .filter(u => u.id !== currentUser?.id)
              .filter(u => !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
              .filter(u => {
                if (filterType !== 'UNREAD') return true;
                const unread = chatMessages.filter(m => String(m.senderId) === String(u.id) && String(m.recipientId) === String(currentUser?.id) && !m.isRead).length;
                return unread > 0;
              })
              .map(user => {
                const isSelected = String(activeChatId) === String(user.id) && chatType === 'DIRECT';
                const dmMessages = chatMessages.filter(msg =>
                  (String(msg.senderId) === String(currentUser?.id) && String(msg.recipientId) === String(user.id)) ||
                  (String(msg.senderId) === String(user.id) && String(msg.recipientId) === String(currentUser?.id))
                );
                const lastMsg = dmMessages[dmMessages.length - 1];
                const unreadCount = chatMessages.filter(m =>
                  String(m.senderId) === String(user.id) &&
                  String(m.recipientId) === String(currentUser?.id) &&
                  !m.isRead
                ).length;

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      setActiveChatId(user.id);
                      setChatType('DIRECT');
                    }}
                    className={`px-3.5 py-3 flex items-center space-x-3 cursor-pointer transition-all border-l-4 ${
                      isSelected ? 'bg-[#e7fce3] border-[#00a884]' : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                        isUserOnline(user) ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
                        <span className={`text-[10px] font-mono shrink-0 ${unreadCount > 0 ? 'text-[#25d366] font-bold' : 'text-slate-400'}`}>
                          {lastMsg?.timestamp || ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-slate-500 truncate flex-1">
                          {lastMsg ? (
                            Boolean(lastMsg.isDeleted || lastMsg.deleted) ? (
                              <span className="italic text-slate-400 flex items-center space-x-1">
                                <Ban className="w-3 h-3 text-slate-400 shrink-0 mr-1 inline" />
                                <span>{String(lastMsg.senderId) === String(currentUser?.id) ? 'You deleted this message' : 'This message was deleted'}</span>
                              </span>
                            ) : (
                              lastMsg.content || 'Shared attachment'
                            )
                          ) : user.email}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-[#25d366] text-white font-bold text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] text-center inline-flex items-center justify-center leading-none shrink-0 ml-1.5 shadow-2xs">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* RIGHT WORKSPACE: WHATSAPP CHAT CANVAS */}
      <div className="flex-1 flex flex-col bg-[#efeae2] h-full min-w-0 relative">
        {/* Chat Header Bar */}
        <div className="h-16 px-5 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between shrink-0 z-10 shadow-2xs">
          <div className="flex items-center space-x-3 truncate cursor-pointer" onClick={() => setShowRightDrawer(!showRightDrawer)}>
            {chatType === 'CHANNEL' ? (
              <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-lg shrink-0">
                #
              </div>
            ) : (
              <img
                src={activeUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeTitle)}&background=00a884&color=fff`}
                alt={activeTitle}
                className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
              />
            )}
            <div className="truncate">
              <h3 className="text-sm font-bold text-slate-900 truncate leading-snug">
                {chatType === 'CHANNEL' ? `# ${activeTitle}` : activeTitle}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">{activeSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRightDrawer(!showRightDrawer)}
              className="p-2 hover:bg-slate-200/80 rounded-full text-slate-600 transition-colors"
              title="Group / Contact Info"
            >
              <Info className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* WhatsApp Chat Canvas Background Overlay */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar relative"
          style={{
            backgroundColor: '#efeae2',
            backgroundImage: `radial-gradient(#0000000d 1.2px, transparent 1.2px)`,
            backgroundSize: '20px 20px'
          }}
        >
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="px-4 py-2 bg-[#ffe299] text-amber-900 rounded-lg text-xs shadow-2xs font-medium flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-900 shrink-0" />
                <span>Messages are end-to-end encrypted across StandupFlow LAN network.</span>
              </div>
              <p className="text-xs text-slate-500">Say Hi or attach files to begin messaging in {activeTitle}</p>
            </div>
          ) : (
            currentMessages.map(msg => {
              const isMine = String(msg.senderId) === String(currentUser?.id) || msg.senderName === currentUser?.name;
              const isMsgDeleted = Boolean(msg.isDeleted || msg.deleted);
              const canDelete = (isMine || currentUser?.role === 'MANAGER') && !isMsgDeleted;

              return (
                <div
                  key={msg.id}
                  className={`flex items-center space-x-2 group/msg ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Delete button on left side for received messages */}
                  {!isMine && canDelete && (
                    <button
                      onClick={() => deleteChatMessage(msg.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover/msg:opacity-100 transition-all duration-150 shrink-0"
                      title="Delete message for everyone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div
                    className={`relative max-w-[80%] md:max-w-[65%] px-3.5 py-2 rounded-lg shadow-2xs text-xs leading-relaxed ${
                      isMsgDeleted
                        ? isMine ? 'bg-[#e2f7db]/70 border border-emerald-200/50' : 'bg-slate-100/90 border border-slate-200/80'
                        : isMine
                          ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                          : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'
                    }`}
                  >
                    {/* Sender Name for received messages in Group Channels */}
                    {!isMine && chatType === 'CHANNEL' && !isMsgDeleted && (
                      <div className="text-[11px] font-bold text-[#008f70] mb-0.5">
                        {msg.senderName}
                      </div>
                    )}

                    {/* Deleted Message Placeholder (WhatsApp Style) */}
                    {isMsgDeleted ? (
                      <div className="flex items-center space-x-1.5 text-slate-500 italic text-xs py-0.5 select-none font-sans">
                        <Ban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {isMine ? 'You deleted this message' : 'This message was deleted'}
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Message Content */}
                        {msg.content && <p className="whitespace-pre-wrap font-sans text-xs pr-1">{msg.content}</p>}

                        {/* Attachments (Real Uploads & Previews) */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {msg.attachments.map(att => (
                              <div
                                key={att.id}
                                className={`p-2.5 rounded-lg border flex items-center space-x-3 ${
                                  isMine ? 'bg-[#c5f8bc] border-emerald-300' : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                {att.type?.includes('image') ? (
                                  <div className="space-y-1 w-full">
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      className="max-h-48 w-full object-cover rounded-md border border-slate-200"
                                    />
                                    <div className="text-[10px] text-slate-500 truncate">{att.name}</div>
                                  </div>
                                ) : (
                                  <>
                                    <FileText className="w-6 h-6 text-red-600 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold text-xs text-slate-900 truncate">{att.name}</div>
                                      <div className="text-[10px] text-slate-500 font-mono">{att.size}</div>
                                    </div>
                                    <a
                                      href={att.url}
                                      download={att.name}
                                      className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded shadow-2xs shrink-0"
                                      title="Download File"
                                    >
                                      <Download className="w-4 h-4 text-emerald-700" />
                                    </a>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Timestamp & Read Checkmarks */}
                    <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-slate-400 font-mono float-right ml-3">
                      <span>{msg.timestamp}</span>
                      {isMine && !isMsgDeleted && (
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-[#53bdeb]' : 'text-slate-400'}`} />
                      )}
                    </div>
                  </div>

                  {/* Delete button on right side for sent messages */}
                  {isMine && canDelete && (
                    <button
                      onClick={() => deleteChatMessage(msg.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover/msg:opacity-100 transition-all duration-150 shrink-0"
                      title="Delete message for everyone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM INPUT COMPOSER (WHATSAPP WEB FOOTER) */}
        <div className="bg-[#f0f2f5] px-4 py-3 border-t border-slate-200 shrink-0 relative">
          {/* Pending Attachments Banner */}
          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5 p-2 bg-white rounded-lg border border-slate-300 shadow-2xs">
              {pendingFiles.map(file => (
                <div key={file.id} className="flex items-center space-x-2 bg-[#e7fce3] text-[#008f70] px-2.5 py-1 rounded-md text-xs font-semibold">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removePendingFile(file.id)} className="text-red-500 hover:text-red-700 ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Attachment Menu Popup */}
          {showAttachMenu && (
            <div className="absolute bottom-16 left-4 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-100 rounded-lg text-xs text-slate-800 font-semibold"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <span>Document (PDF / DOCX / Text)</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-100 rounded-lg text-xs text-slate-800 font-semibold"
              >
                <ImageIcon className="w-4 h-4 text-purple-500" />
                <span>Photos & Videos</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-full transition-colors shrink-0"
              title="Attach Document or Image"
            >
              <Paperclip className="w-5 h-5 text-slate-600" />
            </button>

            <input
              type="text"
              placeholder="Type a message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 bg-white border-none rounded-lg px-4 py-2.5 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#00a884] placeholder-slate-500 font-sans shadow-2xs"
            />

            <button
              type="submit"
              disabled={!messageInput.trim() && pendingFiles.length === 0}
              className="p-2.5 bg-[#00a884] hover:bg-[#008f70] disabled:opacity-50 text-white rounded-full transition-all shadow-md shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT DRAWER: GROUP / CONTACT DETAILS & SHARED MEDIA */}
      {showRightDrawer && (
        <div className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 h-full">
          <div className="h-16 px-4 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between shrink-0">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {chatType === 'CHANNEL' ? 'Group Info' : 'Contact Info'}
            </h4>
            <button onClick={() => setShowRightDrawer(false)} className="p-1 hover:bg-slate-200 rounded-full">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="p-6 text-center border-b border-slate-100 space-y-2">
            {chatType === 'CHANNEL' ? (
              <div className="w-20 h-20 rounded-full bg-[#00a884] text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
                #
              </div>
            ) : (
              <img
                src={activeUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeTitle)}&background=00a884&color=fff`}
                alt={activeTitle}
                className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-slate-200 shadow-md"
              />
            )}
            <h3 className="text-base font-bold text-slate-900">{activeTitle}</h3>
            <p className="text-xs text-slate-500">{activeSubtitle}</p>
          </div>

          {/* Shared Files Gallery */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Shared Files ({sharedFiles.length})
            </div>
            {sharedFiles.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No files shared yet</div>
            ) : (
              <div className="space-y-2">
                {sharedFiles.map(file => (
                  <div key={file.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{file.size}</div>
                      </div>
                    </div>
                    <a href={file.url} download={file.name} className="p-1 text-slate-600 hover:text-emerald-700">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WHATSAPP WEB STYLE 2-STEP GROUP CREATION MODAL */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-[#00a884] text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {groupStep === 2 && (
                  <button onClick={() => setGroupStep(1)} className="hover:opacity-80">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h3 className="text-base font-bold">
                  {groupStep === 1 ? 'Add group members' : 'New group'}
                </h3>
              </div>
              <button onClick={() => setIsGroupModalOpen(false)} className="hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: SELECT MEMBERS */}
            {groupStep === 1 && (
              <div className="p-6 space-y-4 text-xs">
                {/* Selected Members Chips */}
                {selectedMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-[#f0f2f5] rounded-lg border border-slate-200 max-h-24 overflow-y-auto">
                    {selectedMemberIds.map(mId => {
                      const member = users.find(u => String(u.id) === String(mId));
                      return (
                        <div key={mId} className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                          <span className="font-semibold text-slate-800">{member?.name || mId}</span>
                          <button onClick={() => toggleSelectMember(mId)} className="text-slate-400 hover:text-red-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Member Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={groupSearchQuery}
                    onChange={(e) => setGroupSearchQuery(e.target.value)}
                    className="w-full bg-[#f0f2f5] border-none rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#00a884]"
                  />
                </div>

                {/* Workspace Members Roster List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {users
                    .filter(u => u.id !== currentUser?.id)
                    .filter(u => !groupSearchQuery || u.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(groupSearchQuery.toLowerCase()))
                    .map(user => {
                      const isSelected = selectedMemberIds.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          onClick={() => toggleSelectMember(user.id)}
                          className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-[#e7fce3]' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=00a884&color=fff`}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{user.name}</div>
                              <div className="text-[11px] text-slate-500">{user.email} • {user.role}</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-[#00a884] border-[#00a884] text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Step 1 Footer */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">{selectedMemberIds.length} members selected</span>
                  <button
                    onClick={() => setGroupStep(2)}
                    disabled={selectedMemberIds.length === 0}
                    className="p-3 bg-[#00a884] hover:bg-[#008f70] disabled:opacity-50 text-white rounded-full shadow-md transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: GROUP NAME & SUBJECT */}
            {groupStep === 2 && (
              <form onSubmit={handleCreateGroup} className="p-6 space-y-4 text-xs">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#f0f2f5] border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors">
                    <Camera className="w-8 h-8 text-[#00a884]" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Group Subject / Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Type group subject..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-[#f0f2f5] border-b-2 border-[#00a884] rounded-t-lg px-3 py-2.5 outline-none font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">Group Description</label>
                  <textarea
                    rows={2}
                    placeholder="Add a group description..."
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    className="w-full bg-[#f0f2f5] border border-slate-200 rounded-lg p-2.5 outline-none font-sans"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="p-3 bg-[#00a884] hover:bg-[#008f70] text-white rounded-full shadow-md flex items-center justify-center transition-colors"
                    title="Create Group"
                  >
                    <Check className="w-6 h-6" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
