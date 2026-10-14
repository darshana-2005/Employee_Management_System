package com.example.ems.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.example.ems.entity.Department;
import com.example.ems.entity.Employee;
import com.example.ems.entity.User;
import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
import com.example.ems.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    @Value("${app.admin.username:admin}") private String username;
    @Value("${app.admin.password:ChangeMe123!}") private String password;
    @Value("${app.employee.password:Welcome123!}") private String employeePassword;

    public DataSeeder(UserRepository userRepository, DepartmentRepository departmentRepository,
                      EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.findByUsername(username).isPresent()) {
            userRepository.save(new User(username, passwordEncoder.encode(password), "ADMIN"));
        }
        if (departmentRepository.count() == 0) {
            Department product = departmentRepository.save(new Department("Product", "Product strategy and delivery"));
            Department engineering = departmentRepository.save(new Department("Engineering", "Software and platform"));
            departmentRepository.save(new Department("People", "People operations"));
            if (employeeRepository.count() == 0) {
                employeeRepository.save(new Employee("Avery", "Morgan", "avery.morgan@example.com", "Product Designer",
                        "+1 555 0134", LocalDate.of(2022, 4, 11), new BigDecimal("92000"), "Active", product));
                employeeRepository.save(new Employee("Jordan", "Lee", "jordan.lee@example.com", "Software Engineer",
                        "+1 555 0178", LocalDate.of(2021, 8, 2), new BigDecimal("118000"), "Active", engineering));
            }
        }
        seedEmployeeAccount("avery", "avery.morgan@example.com");
        seedEmployeeAccount("jordan", "jordan.lee@example.com");
    }

    private void seedEmployeeAccount(String accountName, String email) {
        employeeRepository.findByEmailIgnoreCase(email).ifPresent(employee -> {
            if (!userRepository.findByUsername(accountName).isPresent()) {
                userRepository.save(new User(accountName, passwordEncoder.encode(employeePassword),
                        "EMPLOYEE", employee.getId()));
            }
        });
    }
}