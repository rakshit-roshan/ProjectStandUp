package com.standupflow.repository;

import com.standupflow.model.CompanyRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRegistrationRepository extends JpaRepository<CompanyRegistration, Long> {

    Optional<CompanyRegistration> findByRootUserEmail(String rootUserEmail);

    Optional<CompanyRegistration> findByCompanyId(String companyId);
}
