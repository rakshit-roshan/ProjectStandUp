package com.standupflow.config;

import com.standupflow.service.TenantDatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TenantDatabaseService tenantDatabaseService;

    @Override
    public void run(String... args) throws Exception {
        // Ensure master database (standupflow_db) contains ONLY tblOrg_details
        tenantDatabaseService.ensureMasterTableExists();
    }
}
