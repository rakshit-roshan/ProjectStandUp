package com.standupflow.controller;

import com.standupflow.model.ChatChannel;
import com.standupflow.model.ChatMessage;
import com.standupflow.repository.ChatChannelRepository;
import com.standupflow.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatChannelRepository chatChannelRepository;

    @GetMapping("/messages")
    public List<ChatMessage> getAllMessages() {
        return chatMessageRepository.findAll();
    }

    @PostMapping("/messages")
    public ChatMessage sendMessage(@RequestBody ChatMessage message) {
        if (message.getId() == null || message.getId().isBlank()) {
            message.setId("MSG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (message.getTimestamp() == null || message.getTimestamp().isBlank()) {
            message.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        }
        return chatMessageRepository.save(message);
    }

    @GetMapping("/channels")
    public List<ChatChannel> getChannels() {
        return chatChannelRepository.findAll();
    }

    @PostMapping("/channels")
    public ChatChannel createChannel(@RequestBody ChatChannel channel) {
        if (channel.getId() == null || channel.getId().isBlank()) {
            channel.setId("CH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (channel.getCreatedAt() == null) {
            channel.setCreatedAt(LocalDateTime.now().toString());
        }
        return chatChannelRepository.save(channel);
    }

    @PutMapping("/messages/read")
    public ResponseEntity<Void> markMessagesAsRead(@RequestParam String senderId, @RequestParam String recipientId) {
        List<ChatMessage> list = chatMessageRepository.findAll();
        for (ChatMessage m : list) {
            if (m.getSenderId() != null && m.getRecipientId() != null &&
                m.getSenderId().equalsIgnoreCase(senderId) && m.getRecipientId().equalsIgnoreCase(recipientId)) {
                m.setIsRead(true);
                chatMessageRepository.save(m);
            }
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<ChatMessage> deleteMessage(@PathVariable String id) {
        Optional<ChatMessage> opt = chatMessageRepository.findById(id);
        if (opt.isPresent()) {
            ChatMessage msg = opt.get();
            msg.setIsDeleted(true);
            msg.setContent("This message was deleted");
            msg.setAttachmentsJson(null);
            msg.setAttachments(null);
            ChatMessage saved = chatMessageRepository.save(msg);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }
}
