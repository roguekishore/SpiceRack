package com.example.springapp.entities;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import com.example.springapp.dto.RecipeGroceryDTO;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table( name = "recipes")
public class Recipes {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int minutes;
    private String instructions;

    @OneToMany(mappedBy = "recipe")
    @JsonIgnore
    private List<RecipeGrocery> requiredGroceries;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Transient 
    private List<RecipeGroceryDTO> requiredGroceryDTOs;

    public void setInstructionsList(List<String> instructionsList) {
        if (instructionsList != null) {
            this.instructions = instructionsList.stream()
                .collect(Collectors.joining("; "));
        } else {
            this.instructions = null;
        }
    }

    public List<String> getInstructionsList() {
        if (this.instructions != null && !this.instructions.isEmpty()) {
            return Arrays.asList(this.instructions.split("; "));
        } else {
            return null;
        }
    }

    @Override
    public String toString() {
        return "Recipes{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}