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
        // 1. Tenta extrair o token do cabeçalho da requisição
        var token = this.recuperarToken(request);

        if (token != null) {
            // 2. A "Casa da Moeda" valida a criptografia e devolve o dono do token (o UUID que salvamos no Subject)
            var subjectUuid = tokenServices.validarToken(token);

            // 3. Busca a entidade rica no banco de dados usando o UUID extraído
            var usuario = userRepository.findById(java.util.UUID.fromString(subjectUuid))
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));


            var authentication = new UsernamePasswordAuthenticationToken(usuario, null, null);

            // 5. Injeta a autenticação no contexto atual (cura a amnésia do Spring para esta requisição)
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 6. Continua o fluxo normal da requisição (passa para o próximo filtro ou vai para o Controller)
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
