package com.standupflow.config;

import org.springframework.context.annotation.Configuration;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

@Configuration
public class IniConfigLoader {

    static {
        loadIniConfig();
    }

    public static void loadIniConfig() {
        Path[] candidatePaths = new Path[] {
            Paths.get("../config.ini"),
            Paths.get("config.ini"),
            Paths.get("../../config.ini")
        };

        File configFile = null;
        for (Path p : candidatePaths) {
            File f = p.toFile();
            if (f.exists() && f.isFile()) {
                configFile = f;
                break;
            }
        }

        if (configFile == null) {
            System.out.println("[IniConfigLoader] config.ini not found in standard candidate paths. Fallback to default properties.");
            return;
        }

        System.out.println("[IniConfigLoader] Loading dynamic configuration from: " + configFile.getAbsolutePath());
        Properties iniProps = new Properties();

        try (BufferedReader reader = new BufferedReader(new FileReader(configFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || line.startsWith(";")) {
                    continue;
                }
                if (line.startsWith("[") && line.endsWith("]")) {
                    continue;
                }
                int eqIdx = line.indexOf('=');
                if (eqIdx > 0) {
                    String key = line.substring(0, eqIdx).trim();
                    String value = line.substring(eqIdx + 1).trim();
                    if (!key.isEmpty()) {
                        iniProps.setProperty(key, value);
                        if (System.getProperty(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
            }

            if (iniProps.containsKey("db_host") && iniProps.containsKey("db_name")) {
                String host = iniProps.getProperty("db_host", "localhost");
                String port = iniProps.getProperty("db_port", "3306");
                String dbName = iniProps.getProperty("db_name", "standupflow_db");
                String url = "jdbc:mariadb://" + host + ":" + port + "/" + dbName + "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true";
                if (System.getProperty("spring.datasource.url") == null) {
                    System.setProperty("spring.datasource.url", url);
                }
            }
            if (iniProps.containsKey("db_username") && System.getProperty("spring.datasource.username") == null) {
                System.setProperty("spring.datasource.username", iniProps.getProperty("db_username"));
            }
            if (iniProps.containsKey("db_password") && System.getProperty("spring.datasource.password") == null) {
                System.setProperty("spring.datasource.password", iniProps.getProperty("db_password"));
            }
            if (iniProps.containsKey("server_port") && System.getProperty("server.port") == null) {
                System.setProperty("server.port", iniProps.getProperty("server_port"));
            }
        } catch (Exception e) {
            System.err.println("[IniConfigLoader] Failed to read config.ini: " + e.getMessage());
        }
    }
}
