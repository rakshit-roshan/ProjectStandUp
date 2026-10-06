package com.standupflow.config;

public class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT_DB = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_COMPANY_ID = new ThreadLocal<>();

    public static void setTenant(String companyId, String databaseName) {
        CURRENT_COMPANY_ID.set(companyId);
        CURRENT_TENANT_DB.set(databaseName);
    }

    public static String getDatabaseName() {
        return CURRENT_TENANT_DB.get();
    }

    public static String getCompanyId() {
        return CURRENT_COMPANY_ID.get();
    }

    public static void clear() {
        CURRENT_TENANT_DB.remove();
        CURRENT_COMPANY_ID.remove();
    }
}
