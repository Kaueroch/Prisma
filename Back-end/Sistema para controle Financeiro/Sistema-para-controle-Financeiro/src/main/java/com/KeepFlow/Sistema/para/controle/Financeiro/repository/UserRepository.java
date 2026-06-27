package com.KeepFlow.Sistema.para.controle.Financeiro.repository;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);
}
