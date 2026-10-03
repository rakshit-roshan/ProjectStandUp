package com.standupflow.repository;

import com.standupflow.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByChannelId(String channelId);
    List<ChatMessage> findByRecipientIdOrSenderId(String recipientId, String senderId);
}
