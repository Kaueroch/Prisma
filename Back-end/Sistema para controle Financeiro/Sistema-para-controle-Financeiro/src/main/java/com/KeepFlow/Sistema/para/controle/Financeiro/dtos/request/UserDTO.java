package com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request;

import java.util.UUID;

public record UserDTO(UUID id, String nome, String email, String senha) {
}
