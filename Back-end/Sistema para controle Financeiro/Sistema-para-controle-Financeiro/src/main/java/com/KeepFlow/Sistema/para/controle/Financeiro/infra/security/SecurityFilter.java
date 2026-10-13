package com.KeepFlow.Sistema.para.controle.Financeiro.infra.security;

import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao.TokenServices;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {
    private final TokenServices tokenServices;
    private final UserRepository userRepository;

    public SecurityFilter(TokenServices tokenServices, UserRepository userRepository) {
        this.tokenServices = tokenServices;
        this.userRepository = userRepository;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 1. Try to extract the token from the request header
        var token = this.recuperarToken(request);

        if (token != null) {
            // 2. The token validator checks the signature and returns the token owner (the UUID saved in the subject)
            var subjectUuid = tokenServices.validarToken(token);

            // 3. Look up the rich entity in the database using the extracted UUID
            var usuario = userRepository.findById(java.util.UUID.fromString(subjectUuid))
                    .orElseThrow(() -> new RuntimeException("User not found."));


            var authentication = new UsernamePasswordAuthenticationToken(usuario, null, null);

            // 5. Inject the authentication into the current context for this request
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 6. Continue the normal request flow (pass to the next filter or go to the controller)
        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.replace("Bearer ", "");
        }
        return null;
    }
}
