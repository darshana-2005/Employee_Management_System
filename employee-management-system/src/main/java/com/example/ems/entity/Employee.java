package com.example.ems.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String position;
    private String phone;
    private LocalDate hireDate;
    private BigDecimal salary;
    @Column(nullable = false)
    private String employmentStatus = "Active";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    protected Employee() { }

    public Employee(String firstName, String lastName, String email, String position, String phone,
                    LocalDate hireDate, BigDecimal salary, String employmentStatus, Department department) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.position = position;
        this.phone = phone;
        this.hireDate = hireDate;
        this.salary = salary;
        this.employmentStatus = employmentStatus;
        this.department = department;
    }

    public void update(String firstName, String lastName, String email, String position, String phone,
                       LocalDate hireDate, BigDecimal salary, String employmentStatus, Department department) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.position = position;
        this.phone = phone;
        this.hireDate = hireDate;
        this.salary = salary;
        this.employmentStatus = employmentStatus;
        this.department = department;
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPosition() { return position; }
    public String getPhone() { return phone; }
    public LocalDate getHireDate() { return hireDate; }
    public BigDecimal getSalary() { return salary; }
    public String getEmploymentStatus() { return employmentStatus; }
    public Department getDepartment() { return department; }
}