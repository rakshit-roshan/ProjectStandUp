package com.standupflow.config;

import com.standupflow.model.CompanyRegistration;
import com.standupflow.repository.CompanyRegistrationRepository;
import com.standupflow.service.TenantDatabaseService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class TenantInterceptor extends OncePerRequestFilter {

    @Autowired
    private CompanyRegistrationRepository companyRegistrationRepository;

    @Autowired
    private TenantDatabaseService tenantDatabaseService;

    private final java.util.Set<String> alignedDatabases = java.util.concurrent.ConcurrentHashMap.newKeySet();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Always clear leftover thread-local tenant context first so master database queries hit standupflow_db
        TenantContext.clear();

        // Ensure CORS headers are present on all responses so browser does not block API requests
        String origin = request.getHeader("Origin");
        if (origin != null && !origin.trim().isEmpty()) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            response.setHeader("Access-Control-Allow-Origin", "*");
        }
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // Preflight OPTIONS requests must immediately return 200 OK without requiring tenant headers
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/register") || path.startsWith("/api/v1/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        String companyId = request.getHeader("X-Company-Id");
        if (companyId == null || companyId.trim().isEmpty()) {
            companyId = request.getHeader("x-company-id");
        }
        if (companyId == null || companyId.trim().isEmpty()) {
            companyId = request.getHeader("Company-Id");
        }
        if (companyId == null || companyId.trim().isEmpty()) {
            companyId = request.getHeader("company-id");
        }
        if (companyId == null || companyId.trim().isEmpty()) {
            companyId = request.getParameter("companyId");
        }

        if (companyId != null && !companyId.trim().isEmpty()) {
            String cleanCompanyId = companyId.trim().replace("\"", "").replace("'", "");
            Optional<CompanyRegistration> regOpt = tenantDatabaseService.findCompanyRegistrationByIdOrEmail(cleanCompanyId);

            if (regOpt.isEmpty()) {
                // Tenant registration record deleted
                rejectDeletedTenant(response, "Company workspace registration has been deleted.");
                return;
            }

            CompanyRegistration reg = regOpt.get();
            if (!tenantDatabaseService.doesTenantDatabaseExist(reg.getDatabaseName())) {
                // Physical database deleted
                rejectDeletedTenant(response, "Company database " + reg.getDatabaseName() + " no longer exists.");
                return;
            }

            if (alignedDatabases.add(reg.getDatabaseName())) {
                tenantDatabaseService.alignAllTenantTableSchemas(reg.getDatabaseName());
            }

            TenantContext.setTenant(reg.getCompanyId(), reg.getDatabaseName());
            System.out.println("[TenantInterceptor] Set tenant context -> Company: " + reg.getCompanyId() + " | DB: " + reg.getDatabaseName() + " for request: " + path);
        } else {
            TenantContext.clear();
            System.out.println("[TenantInterceptor] No X-Company-Id header provided for request: " + path + " (Rejecting: master database standupflow_db contains ONLY tblOrg_details)");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"MISSING_COMPANY_ID\", \"message\": \"Header 'X-Company-Id' is required. Workspace data is stored in the company database.\"}");
            return;
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private void rejectDeletedTenant(HttpServletResponse response, String message) throws IOException {
        TenantContext.clear();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setHeader("X-Tenant-Deleted", "true");
        response.getWriter().write(String.format(
                "{\"error\": \"TENANT_DELETED\", \"message\": \"%s\"}", message
        ));
    }
}
