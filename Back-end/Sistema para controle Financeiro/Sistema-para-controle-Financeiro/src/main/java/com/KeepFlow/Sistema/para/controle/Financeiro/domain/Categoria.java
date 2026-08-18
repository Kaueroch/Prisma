package com.KeepFlow.Sistema.para.controle.Financeiro.domain;

import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CampoNomeVazio;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_categorias")
public class Categoria{
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  @Column(name = "cd_id")
  private Integer id;
  @Column(name = "nm_nome")
  private String nome;
  @Column(name = "ds_tipoCategoria")
  private String tipoCategoria;

  public Integer getId() {
    return id;
  }

  public String getNome() {
    return nome;
  }

  public String getTipoCategoria() {
    return tipoCategoria;
  }

  public Categoria(String _nome, String _tipoCategoria){
      camposVazios(_nome);
      this.nome = _nome; 
      this.tipoCategoria = _tipoCategoria;
    }


    private void camposVazios(String nome){
  if(nome.length() < 3 || nome.length() > 15){
  throw new CampoNomeVazio("Por favor preencha a categoria com pelo menos 3 caracteres e no maximo 15"); 
  }
  }
}
