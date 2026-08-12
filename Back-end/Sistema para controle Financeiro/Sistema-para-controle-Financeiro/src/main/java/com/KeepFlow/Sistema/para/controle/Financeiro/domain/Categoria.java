package com.KeepFlow.Sistema.para.controle.Financeiro.domain;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.UUID;

@Entity
@Table(name = "tb_categorias")
public class Categoria {
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cd_id")
    private UUID id;

    @Getter
    @Column(name = "nm_nome")
    private String nome;

    @Getter
    @Column(name = "ds_cor")
    private String cor;

    @Getter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_usuario_id")
    private User usuario;

    protected Categoria() {
    }

    public Categoria(String nome, String cor, User usuario) {
        this.nome = nome;
        this.cor = cor;
        this.usuario = usuario;
    }
}
