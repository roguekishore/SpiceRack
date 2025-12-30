package com.example.springapp.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.springapp.entities.Grocery;

public interface GroceryRepository extends JpaRepository<Grocery , Long>{

    @Query("SELECT g FROM Grocery g WHERE g.name LIKE %:name% ")
    Page<Grocery> findByNameContaining(String name, Pageable pageable);
    
    Page<Grocery> findAll(Pageable pageable);

    @Query("SELECT g FROM Grocery g WHERE (:name IS NULL OR LOWER(g.name) LIKE LOWER(concat('%', :name, '%')))")
    Page<Grocery> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    @Query("SELECT g FROM Grocery g WHERE (:name IS NULL OR LOWER(g.name) LIKE LOWER(concat('%', :name, '%'))) AND LOWER(g.category) = LOWER(:category)")
    Page<Grocery> findByCategoryAndNameContainingIgnoreCase(@Param("category") String category, @Param("name") String name, Pageable pageable);

    @Query("SELECT g FROM Grocery g WHERE (:name IS NULL OR LOWER(g.name) LIKE LOWER(concat('%', :name, '%'))) AND LOWER(g.type) = LOWER(:type)")
    Page<Grocery> findByTypeAndNameContainingIgnoreCase(@Param("type") String type, @Param("name") String name, Pageable pageable);

    @Query("SELECT g FROM Grocery g WHERE (:name IS NULL OR LOWER(g.name) LIKE LOWER(concat('%', :name, '%'))) AND LOWER(g.type) = LOWER(:type) AND LOWER(g.category) = LOWER(:category)")
    Page<Grocery> findByTypeAndCategoryAndNameContainingIgnoreCase(@Param("type") String type, @Param("category") String category, @Param("name") String name, Pageable pageable);

    @Query("SELECT g FROM Grocery g WHERE LOWER(g.category) = LOWER(:category)")
    Page<Grocery> findByCategory(@Param("category") String category, Pageable pageable);

    @Query("SELECT g FROM Grocery g WHERE LOWER(g.type) = LOWER(:type)")
    Page<Grocery> findByType(@Param("type") String type, Pageable pageable);

    @Query("SELECT g FROM Grocery g WHERE LOWER(g.type) = LOWER(:type) AND LOWER(g.category) = LOWER(:category)")
    Page<Grocery> findByTypeAndCategory(@Param("type") String type, @Param("category") String category, Pageable pageable);
}

// @Query("SELECT g FROM Grocery g WHERE (:name IS NULL OR g.name LIKE %:name%)")
// Page<Grocery> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

// // Query with category and name filters
// @Query("SELECT g FROM Grocery g WHERE (:name IS NULL OR g.name LIKE %:name%) AND g.category = :category")
// Page<Grocery> findByCategoryAndNameContainingIgnoreCase(@Param("category") String category, @Param("name") String name, Pageable pageable);

// // Query with type and name filters
// @Query("SELECT g FROM Grocery g WHERE (:name IS NULL OR g.name LIKE %:name%) AND g.type = :type")
// Page<Grocery> findByTypeAndNameContainingIgnoreCase(@Param("type") String type, @Param("name") String name, Pageable pageable);

// // Query with type, category and name filters
// @Query("SELECT g FROM Grocery g WHERE (:name IS NULL OR g.name LIKE %:name%) AND g.type = :type AND g.category = :category")
// Page<Grocery> findByTypeAndCategoryAndNameContainingIgnoreCase(@Param("type") String type, @Param("category") String category, @Param("name") String name, Pageable pageable);

// // Query with only category filter
// @Query("SELECT g FROM Grocery g WHERE g.category = :category")
// Page<Grocery> findByCategory(@Param("category") String category, Pageable pageable);

// // Query with only type filter
// @Query("SELECT g FROM Grocery g WHERE g.type = :type")
// Page<Grocery> findByType(@Param("type") String type, Pageable pageable);

// // Query with type and category filters
// @Query("SELECT g FROM Grocery g WHERE g.type = :type AND g.category = :category")
// Page<Grocery> findByTypeAndCategory(@Param("type") String type, @Param("category") String category, Pageable pageable);