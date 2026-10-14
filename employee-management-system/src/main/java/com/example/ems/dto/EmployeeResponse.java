package com.example.ems.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.example.ems.entity.Employee;

public class EmployeeResponse {
    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String position;
    private final String phone;
    private final LocalDate hireDate;
    private final BigDecimal salary;
    private final String employmentStatus;
    private final Long departmentId;
    private final String departmentName;

    public EmployeeResponse(Employee employee) {
        this.id = employee.getId();
        this.firstName = employee.getFirstName();
        this.lastName = employee.getLastName();
        this.email = employee.getEmail();
        this.position = employee.getPosition();
        this.phone = employee.getPhone();
        this.hireDate = employee.getHireDate();
        this.salary = employee.getSalary();
        this.employmentStatus = employee.getEmploymentStatus();
        this.departmentId = employee.getDepartment() == null ? null : employee.getDepartment().getId();
        this.departmentName = employee.getDepartment() == null ? null : employee.getDepartment().getName();
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
    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
}