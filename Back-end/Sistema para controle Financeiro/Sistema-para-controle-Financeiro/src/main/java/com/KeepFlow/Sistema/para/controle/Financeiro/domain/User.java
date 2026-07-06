package com.KeepFlow.Sistema.para.controle.Financeiro.domain;

import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.SenhaInsuficiente;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao.AutenticacaoRegisterService;
import jakarta.persistence.*;
import lombok.Getter;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Entity
@Table(name = "tb_users")

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cd_id")
    private UUID id;
    @Column(name = "nm_nome")
    private String nome;
    @Column(name = "ds_email",unique = true)
    private String email;
    @Column(name = "ds_senha")
    private String senha;

    //regex para validar email se são válidos ou nao
       private static final String EMAIL_PATTERN =
            "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
                    + "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
    private static final Pattern pattern = Pattern.compile(EMAIL_PATTERN, Pattern.CASE_INSENSITIVE);
    protected User(){}

    public User(String nome,String email, String senhaPlana){
        validacaoSenha(senhaPlana);
        validarEmail(email);
        this.nome = nome;
        this.email = email;
        this.senha = senhaPlana;
    }

    public void validacaoSenha(String senha){
        if(senha.length() < 8 || senha.length() >=16) {
            throw new SenhaInsuficiente("A senha precisa ter no minimo 8 e no máximo 16 caracteres.");
        }
    }
    public void validarEmail(String email){
        Matcher matcher;
        matcher = pattern.matcher(email);
        matcher.matches();
    }
}