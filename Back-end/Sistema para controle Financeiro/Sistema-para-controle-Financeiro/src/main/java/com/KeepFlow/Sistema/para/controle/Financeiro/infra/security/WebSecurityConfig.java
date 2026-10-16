package com.KeepFlow.Sistema.para.controle.Financeiro.infra.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import jakarta.servlet.http.HttpServletResponse;import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {
   private SecurityFilter securityFilter;
    public WebSecurityConfig(SecurityFilter _securityFilter){
        this.securityFilter = _securityFilter;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(org.springframework.security.config.Customizer.withDefaults())
                // 1. Disable CSRF (required for stateless REST APIs)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Configure the routes
                .authorizeHttpRequests(auth -> auth
                        // Fully allow access to the register and login endpoints
                        .requestMatchers("/api/v1/user/registrar").permitAll()
                        .requestMatchers("/api/v1/user/login").permitAll()
			

			// Line used for development testing
			//.requestMatchers("/api/v1/categoria/criarCategoria").permitAll()
			

			// Any other request requires authentication
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // AUDITORIA: sem entry point o Spring devolvia 403 com página HTML
                // padrão. API REST precisa de 401 em JSON para o front tratar.
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Não autenticado. Faça login novamente.\"}");
                }))
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
