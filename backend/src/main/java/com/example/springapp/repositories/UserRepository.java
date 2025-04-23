package com.example.springapp.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.springapp.entities.User;

public interface UserRepository extends JpaRepository<User , Long>{
    Optional<User> findByEmail(String email);

    @Query ("SELECT u FROM User u")
    List<User> findAllUsersPresent(Sort sort);
}