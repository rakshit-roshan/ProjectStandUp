package com.standupflow.repository;

import com.standupflow.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, String> {
    List<Invitation> findByInviteeEmailAndStatus(String inviteeEmail, String status);
    List<Invitation> findByManagerCode(String managerCode);
    List<Invitation> findByProjectId(String projectId);
}
