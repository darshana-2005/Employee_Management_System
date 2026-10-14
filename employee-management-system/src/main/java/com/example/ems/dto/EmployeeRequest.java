package com.example.ems.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.PositiveOrZero;

public class EmployeeRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank @Email private String email;
    private String position;
    private String phone;
    private LocalDate hireDate;
    @PositiveOrZero private BigDecimal salary;
    private String employmentStatus;
    private Long departmentId;

    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPosition() { return position; }
    public String getPhone() { return phone; }
    public LocalDate getHireDate() { return hireDate; }
    public BigDecimal getSalary() { return salary; }
    public String getEmploymentStatus() { return employmentStatus; }
    public Long getDepartmentId() { return departmentId; }
    public void setFirstName(String value) { firstName = value; }
    public void setLastName(String value) { lastName = value; }
    public void setEmail(String value) { email = value; }
    public void setPosition(String value) { position = value; }
    public void setPhone(String value) { phone = value; }
    public void setHireDate(LocalDate value) { hireDate = value; }
    public void setSalary(BigDecimal value) { salary = value; }
    public void setEmploymentStatus(String value) { employmentStatus = value; }
    public void setDepartmentId(Long value) { departmentId = value; }
}