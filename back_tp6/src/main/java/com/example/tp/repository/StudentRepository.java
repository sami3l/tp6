package com.example.tp.repository;

import java.util.Collection;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.tp.entity.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {


    @Query("SELECT YEAR(s.BirthDate), COUNT(s) FROM Student s GROUP BY YEAR(s.BirthDate)")
    Collection<Object[]> findNbrStudentByYear();


}