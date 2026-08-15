package com.KeepFlow.Sistema.para.controle.Financeiro.infra.cors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class Cors implements WebMvcConfigurer {
//colocando essa variavel para ser injetada via .env por motivos de teste de aplicacao
// cada porta que eu colocar na lista irá ser assumida, caso haja a ausencia da porta principal. 
    @Value("${CORS_ALLOWED_ORIGINS:http://localhost}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600)
                .allowCredentials(true);
    }
}
