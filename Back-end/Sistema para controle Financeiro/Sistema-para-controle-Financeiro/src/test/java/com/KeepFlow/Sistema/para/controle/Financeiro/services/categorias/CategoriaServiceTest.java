package com.KeepFlow.Sistema.para.controle.Financeiro.services.categorias;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.AcessoNegado;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.IdNaoExistente;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.CategoriaRepository;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/**
 * AUDITORIA: cobre o isolamento por usuário — a falha mais grave encontrada
 * (qualquer conta podia editar/deletar categorias de outra).
 */
@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CategoriaService categoriaService;

    private final UUID donoId = UUID.randomUUID();
    private final UUID outroId = UUID.randomUUID();
    private Categoria categoriaDoDono;

    @BeforeEach
    void setUp() {
        User dono = new User("Dono", "dono@test.com", "senha123", "hash");
        ReflectionTestUtils.setField(dono, "id", donoId);
        categoriaDoDono = new Categoria("Mercado", "Despesas", dono);
    }

    @Test
    void deletarCategoria_DoDono_DeveDeletar() {
        when(categoriaRepository.findById(1)).thenReturn(Optional.of(categoriaDoDono));

        categoriaService.deletarCategoria(1, donoId);

        verify(categoriaRepository).delete(categoriaDoDono);
    }

    @Test
    void deletarCategoria_DeOutroDono_DeveNegar() {
        when(categoriaRepository.findById(1)).thenReturn(Optional.of(categoriaDoDono));

        assertThrows(AcessoNegado.class, () -> categoriaService.deletarCategoria(1, outroId));

        verify(categoriaRepository, never()).delete(any());
    }

    @Test
    void deletarCategoria_IdInexistente_DeveRetornar404() {
        when(categoriaRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(IdNaoExistente.class, () -> categoriaService.deletarCategoria(99, donoId));

        verify(categoriaRepository, never()).delete(any());
    }

    @Test
    void editarCategoria_DeOutroDono_DeveNegar() {
        when(categoriaRepository.findById(1)).thenReturn(Optional.of(categoriaDoDono));

        assertThrows(AcessoNegado.class,
                () -> categoriaService.editarCategoria(1, "Novo", "Despesas", outroId));

        verify(categoriaRepository, never()).save(any());
    }
}
