package com.KeepFlow.Sistema.para.controle.Financeiro.domain;

import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CampoNomeVazio;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.TipoTextoNaoAutorizado;

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

  public String getNome() {
    return nome;
  }

  public String getTipoCategoria() {
    return tipoCategoria;
  }

  public Categoria(String _nome, String _tipoCategoria){
      validaCampoNome(_nome);
      //validaCampoCategoria(_tipoCategoria);
      this.nome = _nome;
      this.tipoCategoria = _tipoCategoria;
    }


  private void validaCampoNome(String nome){
  if(nome.length() < 3 || nome.length() > 15){
  throw new CampoNomeVazio("Por favor preencha a categoria com pelo menos 3 caracteres e no maximo 15"); 
  }

}
//ver a logica pq o equals espera comparar um obj, entao vou ter que pensar de criar uma String que é um obj e comparar com o tipo Categoria mas vou ver.
  //private void validaCampoCategoria(String tipoCategoria){
    //if(tipoCategoria.equals("Receita") || tipoCategoria.equals("Despesa")){
    //throw new TipoTextoNaoAutorizado("Apenas Receita ou Despesas são aceitas para serem salvas no banco de dados."); 
    //}
  //}
}
