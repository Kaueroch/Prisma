package com.KeepFlow.Sistema.para.controle.Financeiro.repository;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.UserDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    UserDTO findByEmail(String email);
    Optional<User> findById(UUID uuid);
}
