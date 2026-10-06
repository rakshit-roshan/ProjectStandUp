package com.standupflow.repository;

import com.standupflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    @Query(value = "SELECT * FROM tblUser_details WHERE emailid = :email LIMIT 1", nativeQuery = true)
    Optional<User> findByEmail(@Param("email") String emailid);

    @Query(value = "SELECT * FROM tblUser_details WHERE emailid = :email LIMIT 1", nativeQuery = true)
    Optional<User> findByEmailid(@Param("email") String emailid);

    @Query(value = "SELECT * FROM tblUser_details WHERE username = :username LIMIT 1", nativeQuery = true)
    Optional<User> findByUsername(@Param("username") String username);

    @Query(value = "SELECT * FROM tblUser_details WHERE emailid = :identifier OR username = :identifier LIMIT 1", nativeQuery = true)
    Optional<User> findByEmailOrName(@Param("identifier") String identifier);
}
