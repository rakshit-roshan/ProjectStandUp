package com.standupflow.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class MultiTenantDataSourceConfig {

    @Value("${spring.datasource.url:jdbc:mariadb://localhost:3306/standupflow_db}")
    private String masterDbUrl;

    @Value("${spring.datasource.username:root}")
    private String dbUsername;

    @Value("${spring.datasource.password:escan_123456}")
    private String dbPassword;

    @Value("${spring.datasource.driver-class-name:org.mariadb.jdbc.Driver}")
    private String driverClassName;

    @Bean
    public DataSource masterDataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setDriverClassName(driverClassName);
        ds.setJdbcUrl(masterDbUrl);
        ds.setUsername(dbUsername);
        ds.setPassword(dbPassword);
        ds.setMaximumPoolSize(10);
        ds.setMinimumIdle(2);
        ds.setPoolName("HikariPool-Master");
        return ds;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        return new TenantRoutingDataSource(masterDataSource(), dbUsername, dbPassword, masterDbUrl);
    }
}
