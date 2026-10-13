package com.KeepFlow.Sistema.para.controle.Financeiro.domain;

import java.util.List;

import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CampoVazio;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.TipoTextoNaoAutorizado;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_categorias")
public class Categoria{
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  @Column(name = "cd_id")
  private Integer id;
  @Column(name = "nm_nome", nullable = false)
  private String nome;
  @Column(name = "ds_tipoCategoria",nullable = false)
  private String tipoCategoria;
  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;
  @OneToMany(mappedBy = "categoria")   // Field name in Transacao
  private List<Transacao> transacoes;
  

  public String getNome() {
    return nome;
  }

  public String getTipoCategoria() {
    return tipoCategoria;
  }
  public void setNome(String nome) {
	this.nome = nome;
}

  public void setTipoCategoria(String tipoCategoria) {
	this.tipoCategoria = tipoCategoria;
  }

  protected Categoria(){}
  
  
  public Categoria(String _nome, String _tipoCategoria,User userID){
      validaCampoNome(_nome);
      validaCampoCategoria(_tipoCategoria);
      this.nome = _nome;
      this.tipoCategoria = _tipoCategoria;
      this.user = userID;
    }


  private void validaCampoNome(String nome){
  if(nome.length() < 3 || nome.length() > 15){
   throw new CampoVazio("Please enter a category name with at least 3 and at most 15 characters"); 
  }

}
  private void validaCampoCategoria(String tipoCategoria){
    String receita = new String("Receita");
    String despesa = new String("Despesas");
    if(!tipoCategoria.equals(receita) && !tipoCategoria.equals(despesa)){
    throw new TipoTextoNaoAutorizado("Only Receita or Despesas values are accepted to be saved in the database.");
    }
  }
}
