package com.standupflow.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    private final DataSource defaultDataSource;
    private final String dbUsername;
    private final String dbPassword;
    private final String baseJdbcUrl;
    private final Map<Object, Object> targetDataSourcesMap = new ConcurrentHashMap<>();

    public TenantRoutingDataSource(DataSource defaultDataSource, String dbUsername, String dbPassword, String masterDbUrl) {
        this.defaultDataSource = defaultDataSource;
        this.dbUsername = dbUsername;
        this.dbPassword = dbPassword;
        this.baseJdbcUrl = extractBaseUrl(masterDbUrl);

        targetDataSourcesMap.put("MASTER", defaultDataSource);
        setDefaultTargetDataSource(defaultDataSource);
        setTargetDataSources(targetDataSourcesMap);
    }

    private String extractBaseUrl(String masterDbUrl) {
        if (masterDbUrl != null && masterDbUrl.contains("/")) {
            int slashIdx = masterDbUrl.lastIndexOf("/");
            String base = masterDbUrl.substring(0, slashIdx + 1);
            if (base.contains("?")) {
                base = base.substring(0, base.indexOf("?"));
            }
            return base;
        }
        return "jdbc:mariadb://localhost:3306/";
    }

    @Override
    protected Object determineCurrentLookupKey() {
        String dbName = TenantContext.getDatabaseName();
        if (dbName == null || dbName.trim().isEmpty() || "MASTER".equalsIgnoreCase(dbName)) {
            return "MASTER";
        }

        if (!targetDataSourcesMap.containsKey(dbName)) {
            synchronized (this) {
                if (!targetDataSourcesMap.containsKey(dbName)) {
                    DataSource tenantDs = createTenantDataSource(dbName);
                    targetDataSourcesMap.put(dbName, tenantDs);
                    setTargetDataSources(targetDataSourcesMap);
                    afterPropertiesSet();
                    System.out.println("[TenantRoutingDataSource] Initialized DataSource connection pool for tenant DB: " + dbName);
                }
            }
        }
        return dbName;
    }

    private DataSource createTenantDataSource(String dbName) {
        HikariDataSource ds = new HikariDataSource();
        ds.setDriverClassName("org.mariadb.jdbc.Driver");
        ds.setJdbcUrl(baseJdbcUrl + dbName + "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true");
        ds.setUsername(dbUsername);
        ds.setPassword(dbPassword);
        ds.setMaximumPoolSize(10);
        ds.setMinimumIdle(2);
        ds.setIdleTimeout(30000);
        ds.setPoolName("HikariPool-" + dbName);
        return ds;
    }
}
