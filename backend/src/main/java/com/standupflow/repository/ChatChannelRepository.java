package com.standupflow.repository;

import com.standupflow.model.ChatChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatChannelRepository extends JpaRepository<ChatChannel, String> {
}
