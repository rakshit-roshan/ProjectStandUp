package com.standupflow.repository;

import com.standupflow.model.CompanyRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRegistrationRepository extends JpaRepository<CompanyRegistration, Long> {

    @Query(value = "SELECT * FROM tblOrg_details WHERE root_user_email = :email LIMIT 1", nativeQuery = true)
    Optional<CompanyRegistration> findByRootUserEmail(@Param("email") String rootUserEmail);

    @Query(value = "SELECT * FROM tblOrg_details WHERE company_id = :companyId LIMIT 1", nativeQuery = true)
    Optional<CompanyRegistration> findByCompanyId(@Param("companyId") String companyId);
}
