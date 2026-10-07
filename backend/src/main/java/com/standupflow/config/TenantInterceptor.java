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

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Ignore static assets or open auth endpoints without company header
        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/register") || path.startsWith("/api/v1/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        String companyId = request.getHeader("X-Company-Id");
        if (companyId == null || companyId.trim().isEmpty()) {
            companyId = request.getParameter("companyId");
        }

        if (companyId != null && !companyId.trim().isEmpty()) {
            Optional<CompanyRegistration> regOpt = companyRegistrationRepository.findByCompanyId(companyId.trim());

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

            TenantContext.setTenant(reg.getCompanyId(), reg.getDatabaseName());
            System.out.println("[TenantInterceptor] Set tenant context -> Company: " + reg.getCompanyId() + " | DB: " + reg.getDatabaseName() + " for request: " + path);
        } else {
            TenantContext.clear();
            System.out.println("[TenantInterceptor] No X-Company-Id header provided for request: " + path + " (Defaulting to master db standupflow_db)");
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
