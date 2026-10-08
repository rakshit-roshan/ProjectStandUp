package com.standupflow.repository;

import com.standupflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailid(String emailid);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameOrEmailidOrFullname(String username, String emailid, String fullname);

    default Optional<User> findByUsernameOrEmailOrFullname(String identifier) {
        return findByUsernameOrEmailidOrFullname(identifier, identifier, identifier);
    }

    default Optional<User> findByEmailOrName(String identifier) {
        return findByUsernameOrEmailidOrFullname(identifier, identifier, identifier);
    }

    default Optional<User> findByEmail(String emailid) {
        return findByEmailid(emailid);
    }
}
