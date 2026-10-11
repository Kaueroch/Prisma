package com.KeepFlow.Sistema.para.controle.Financeiro.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CampoVazio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="tb_transacoes")
public class Transacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="cd_id")
	private int id;
    @Column(name = "vl_valor",nullable = false)
    private BigDecimal valor;
    @Column(name = "ds_descricao",nullable = false)
    private String descricao;
    @Column(name = "dt_dataGasto",nullable = false)
    private String data;
    @ManyToOne
    @JoinColumn(name = "categoria_id")   // cria a coluna FK no banco
    private Categoria categoria;
    
    protected Transacao() {}
    
    public Transacao(BigDecimal valor,String descricao,String data,Categoria categoria) {
    	
    }
    private void validaCampoData(String data) {
    	if(data.isBlank()) {
    		throw new CampoVazio("Por favor insira a data corretamente");
    	}
    	//caso contrario chama o metodo pra fazer o parser
    }
    private LocalDate converteStringToDate(String data) {
     DateTimeFormatter parser = DateTimeFormatter.ofPattern("dd/MM/yyyy");
     LocalDate dataParse = LocalDate.parse(data,parser);
     return dataParse;
    }
    private void validaCampoDescricao(String descricao) {
    if(descricao.isBlank()) {
		throw new CampoVazio("Por favor insira a data corretamente");
     }
  }
    
    
  //private void validaCampoValor(BigDecimal valor) {
    //if(){
    	
    //}
  //}
}