package com.KeepFlow.Sistema.para.controle.Financeiro.infra.cors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class Cors implements WebMvcConfigurer {
// Inject this variable via .env for application testing
// Each port added to the list is accepted if the main port is absent.
    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:3000}")
    private String allowedOrigins;

    /**
     * AUDITORIA: o campo {@code allowedOrigins} era injetado mas ignorado —
     * o código usava origem fixa. Agora a lista do .env é a que vale, com
     * saneamento (remove aspas do .env e completa o scheme quando falta).
     */
    private List<String> resolvedOrigins() {
        return Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .map(s -> s.replace("\"", "").replace("'", ""))
                .filter(s -> !s.isEmpty())
                .map(s -> s.contains("://") ? s : "http://" + s)
                .toList();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(resolvedOrigins().toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600)
                .allowCredentials(true);
    }

    /**
     * AUDITORIA: o {@code http.cors(withDefaults())} do Spring Security não
     * enxergava o WebMvcConfigurer, então na prática valia a política padrão.
     * Este bean garante que a cadeia de segurança usa as mesmas origens.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(resolvedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
