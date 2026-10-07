package com.standupflow.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Entity
@Table(name = "chat_messages")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatMessage {

    @Id
    private String id;
    @Column(name = "sender_id")
    private String senderId;
    @Column(name = "sender_name")
    private String senderName;
    @Column(name = "sender_avatar")
    private String senderAvatar;
    @Column(name = "recipient_id")
    private String recipientId; // For 1-on-1 direct messages
    @Column(name = "channel_id")
    private String channelId;   // For group channels (e.g., #general, #dev-team)
    
    @Column(length = 4000)
    private String content;

    @Column(name = "attachments_json", length = 4000)
    private String attachmentsJson; // JSON array of attachment objects {id, name, size, type, url}

    @Transient
    private List<Object> attachments;

    private String timestamp;
    @Column(name = "reactions_json")
    private String reactionsJson;   // JSON array of reaction objects {emoji, count, userIds}
    @Column(name = "is_read")
    private Boolean isRead = false;

    @JsonProperty("isDeleted")
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    public ChatMessage() {}

    public ChatMessage(String id, String senderId, String senderName, String senderAvatar, String recipientId, String channelId, String content, String attachmentsJson, String timestamp, String reactionsJson) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderAvatar = senderAvatar;
        this.recipientId = recipientId;
        this.channelId = channelId;
        this.content = content;
        this.attachmentsJson = attachmentsJson;
        this.timestamp = timestamp;
        this.reactionsJson = reactionsJson;
        this.isRead = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderAvatar() { return senderAvatar; }
    public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAttachmentsJson() { return attachmentsJson; }
    public void setAttachmentsJson(String attachmentsJson) { this.attachmentsJson = attachmentsJson; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getReactionsJson() { return reactionsJson; }
    public void setReactionsJson(String reactionsJson) { this.reactionsJson = reactionsJson; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    @JsonProperty("isDeleted")
    public Boolean getIsDeleted() { return isDeleted != null && isDeleted; }
    @JsonProperty("isDeleted")
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }

    public List<Object> getAttachments() { return attachments; }
    public void setAttachments(List<Object> attachments) { this.attachments = attachments; }
}
