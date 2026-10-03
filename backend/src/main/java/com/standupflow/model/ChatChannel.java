package com.standupflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_channels")
public class ChatChannel {

    @Id
    private String id;
    private String name;
    private String type; // "GROUP" or "DIRECT"
    
    @Column(length = 1000)
    private String description;
    
    @Column(length = 2000)
    private String memberIds; // Comma separated user IDs or emails

    private String createdBy;
    private String createdAt;

    public ChatChannel() {}

    public ChatChannel(String id, String name, String type, String description, String memberIds, String createdBy, String createdAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.memberIds = memberIds;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMemberIds() { return memberIds; }
    public void setMemberIds(String memberIds) { this.memberIds = memberIds; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
