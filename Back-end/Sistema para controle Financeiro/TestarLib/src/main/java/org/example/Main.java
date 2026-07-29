package org.example;

import com.Aprova.domain.StatusAluno;
import com.Aprova.strategy.CalcularMediaUnisanta;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    public static void main(String[] args) {
        CalcularMediaUnisanta calcularMediaUnisanta = new CalcularMediaUnisanta();
        double media = calcularMediaUnisanta.estrategiaCalculoMedia(3.00,2.00);
        System.out.println(media);
        StatusAluno situacaoAluno = calcularMediaUnisanta.situacaoAluno(media);
        System.out.println(situacaoAluno);
    }
}