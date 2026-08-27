package com.KeepFlow.Sistema.para.controle.Financeiro.infra.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
                // 1. Desabilita o CSRF (Essencial para APIs REST Stateless)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Configura as rotas
                .authorizeHttpRequests(auth -> auth
                        // Libera totalmente o acesso ao endpoint de registro e login
                        .requestMatchers("/api/v1/user/registrar").permitAll()
                        .requestMatchers("/api/v1/user/login").permitAll()
			//linha que serve para testes de desenvolvimento
			//.requestMatchers("/api/v1/categoria/criarCategoria").permitAll()
			// Qualquer outra requisição precisará de autenticação
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
