package com.standupflow.repository;

import com.standupflow.model.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    @Query(value = "SELECT * FROM tblRole_permissions WHERE role_code = :code LIMIT 1", nativeQuery = true)
    Optional<RolePermission> findByRoleCode(@Param("code") Integer roleCode);

    @Query(value = "SELECT * FROM tblRole_permissions WHERE role_name = :name LIMIT 1", nativeQuery = true)
    Optional<RolePermission> findByRoleName(@Param("name") String roleName);
}
