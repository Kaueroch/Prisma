package com.KeepFlow.Sistema.para.controle.Financeiro.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

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
    @Column(name = "ds_observacao",nullable = true)
    private String observacao;
    @ManyToOne
    @JoinColumn(name = "categoria_id")   // Creates the FK column in the database
    private Categoria categoria;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    public Transacao() {}
    
    public Transacao(BigDecimal _valor,String _descricao,String _data,Categoria categoria_id,User _user_id) {
    	validaCampoData(_data);
    	validaCampoDescricao(_descricao);
    	validaCampoValor(_valor);
    	this.valor = _valor;
    	this.descricao = _descricao;
    	this.data = _data;
    	this.categoria = categoria_id;
    	this.user = _user_id;
    }
    public Categoria getCategoria() {
        return categoria;
    }

    public User getUser() {
        return user;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    private void validaCampoData(String data) {
    	if(data == null || data.isBlank()) {
    		throw new CampoVazio("Please enter the date correctly");
    	}
    	converteStringToDate(data);
    }
    private LocalDate converteStringToDate(String data) {
     DateTimeFormatter parser = DateTimeFormatter.ofPattern("dd/MM/yyyy");
     try {
         return LocalDate.parse(data,parser);
     } catch (DateTimeParseException e) {
         // AUDITORIA: data fora do padrão estourava DateTimeParseException
         // sem tratamento -> 500 com stacktrace. Agora é 400 explicável.
         throw new CampoVazio("Informe a data no formato DD/MM/AAAA.");
     }
    }
    private void validaCampoDescricao(String descricao) {
    if(descricao == null || descricao.isBlank()) {
 		throw new CampoVazio("Please enter the date correctly");
     }
  }
  private void validaCampoValor(BigDecimal  valor) {
    // AUDITORIA: a checagem antiga era `valor.compareTo(valor) < 0` —
    // compara o valor com ele mesmo, sempre 0, nunca rejeita nada.
    // Negativos e zero passavam direto para o banco.
    if(valor == null || valor.compareTo(BigDecimal.ZERO) <= 0){
    	throw new ValorNegativo("Please enter the correct value.");
    }
  }
  
  
}