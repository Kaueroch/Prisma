package com.KeepFlow.Sistema.para.controle.Financeiro.infra.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // 1. Desabilita o CSRF (Essencial para APIs REST Stateless)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Configura as rotas
                .authorizeHttpRequests(auth -> auth
                        // Libera totalmente o acesso ao endpoint de registro e login
                        .requestMatchers("/api/v1/user/registrar").permitAll()
                        // Qualquer outra requisição precisará de autenticação
                        .anyRequest().authenticated()
                )
                .build();
    }
}