package com.KeepFlow.Sistema.para.controle.Financeiro.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CampoVazio;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.ValorNegativo;

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
    @JoinColumn(name = "categoria_id")   // Creates the FK column in the database
    private Categoria categoria;
    
    public Transacao() {}
    
    public Transacao(BigDecimal _valor,String _descricao,String _data,Categoria categoria_id) {
    	validaCampoData(_data);
    	validaCampoDescricao(_descricao);
    	validaCampoValor(_valor);
    	this.valor = _valor;
    	this.descricao = _descricao;
    	this.data = _data;
    	this.categoria = categoria_id;
    	
    }
    private void validaCampoData(String data) {
    	if(data.isBlank()) {
    		throw new CampoVazio("Please enter the date correctly");
    	}
    	converteStringToDate(data);
    }
    private LocalDate converteStringToDate(String data) {
     DateTimeFormatter parser = DateTimeFormatter.ofPattern("dd/MM/yyyy");
     LocalDate dataParse = LocalDate.parse(data,parser);
     return dataParse;
    }
    private void validaCampoDescricao(String descricao) {
    if(descricao.isBlank()) {
 		throw new CampoVazio("Please enter the date correctly");
     }
  }
  private void validaCampoValor(BigDecimal  valor) {
    if(valor.compareTo(valor) < 0){
    	throw new ValorNegativo("Please enter the correct value.");
    }
  }
  
  
}