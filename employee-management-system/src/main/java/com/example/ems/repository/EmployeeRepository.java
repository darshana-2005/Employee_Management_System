package com.example.ems.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.ems.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByDepartmentId(Long departmentId);
    Optional<Employee> findByEmailIgnoreCase(String email);
}