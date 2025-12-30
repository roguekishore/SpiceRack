package com.example.springapp.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "recipe_grocery")
public class RecipeGrocery {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    private Recipes recipe;

    @ManyToOne
    private Grocery grocery;

    private double quantity;
    private String unit;

    @Override
    public String toString() {
        return "RecipeGrocery{" +
                "id=" + id +
                ", quantity=" + quantity +
                ", unit='" + unit + '\'' +
                '}';
    }
}