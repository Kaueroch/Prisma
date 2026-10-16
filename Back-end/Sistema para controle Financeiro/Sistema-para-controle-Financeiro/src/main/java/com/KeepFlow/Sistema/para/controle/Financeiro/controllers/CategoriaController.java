package com.KeepFlow.Sistema.para.controle.Financeiro.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.CategoriaDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.response.CategoriaResponseDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.categorias.CategoriaService;

@RestController
@RequestMapping("/api/v1/categoria")
public class CategoriaController{
     private final CategoriaService categoriaService;
     
	public CategoriaController(CategoriaService _categoriaService){
	  this.categoriaService = _categoriaService;
	}

	/**
	 * AUDITORIA: o dono nunca vem do cliente (query param / corpo) — sempre
	 * do token. O front continua mandando userId como antes; o valor é
	 * ignorado, então não precisa mudar nada no front.
	 */
	private UUID usuarioAutenticado() {
		return ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
	}

	@PostMapping("/criarCategoria")
	public ResponseEntity<CategoriaResponseDTO> criarCategoria(@RequestBody CategoriaDTO dto){
         categoriaService.SalvarCategoria(dto.nome(), dto.tipoCategoria(), usuarioAutenticado());
         CategoriaResponseDTO response = new CategoriaResponseDTO("The category was created.");
         return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/listar")
	public List<CategoriaDTO> listarCategorias(@RequestParam(required = false) UUID userId){
     return categoriaService.retornaTodasCategorias(usuarioAutenticado());
	}
	@DeleteMapping("/deletar")
	public ResponseEntity<CategoriaResponseDTO> deletarCategoria(@RequestParam Integer id){
		categoriaService.deletarCategoria(id, usuarioAutenticado());
		return ResponseEntity.status(HttpStatus.OK).body(new CategoriaResponseDTO("Category deleted!"));
	}
	@PutMapping("/atualizarLista")
	public ResponseEntity<CategoriaResponseDTO> atualizarCategoria(@RequestParam Integer id, @RequestBody CategoriaDTO dto){
		categoriaService.editarCategoria(id, dto.nome(), dto.tipoCategoria(), usuarioAutenticado());
		return ResponseEntity.status(HttpStatus.OK).body(new CategoriaResponseDTO("Category updated!"));
	}
}
