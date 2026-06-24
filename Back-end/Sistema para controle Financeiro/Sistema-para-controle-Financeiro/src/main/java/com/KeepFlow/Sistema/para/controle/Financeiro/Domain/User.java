package com.KeepFlow.Sistema.para.controle.Financeiro.Domain;

import com.KeepFlow.Sistema.para.controle.Financeiro.infra.CustomExceptions.SenhaInsuficiente;
import jakarta.persistence.*;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Entity
@Table(name = "User")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID cd_id;
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

    public void ValidacaoSenha(String senha){
        if(senha.length() < 8 || senha.length() >=16){
          throw new SenhaInsuficiente("A senha precisa ter no minimo 8 e no máximo 16 caracteres.");
        }
    }
    public static boolean ValidarEmail(String email){
        Matcher matcher;
        matcher = pattern.matcher(email);
        return matcher.matches();
    }
}