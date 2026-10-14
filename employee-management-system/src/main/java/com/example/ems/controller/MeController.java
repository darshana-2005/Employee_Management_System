package com.example.ems.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import com.example.ems.dto.AttendanceRecordResponse;
import com.example.ems.dto.EmployeeResponse;
import com.example.ems.entity.User;
import com.example.ems.repository.UserRepository;
import com.example.ems.service.AttendanceService;
import com.example.ems.service.EmployeeService;

@RestController
@RequestMapping("/api/me")
public class MeController {
    private final UserRepository userRepository;
    private final EmployeeService employeeService;
    private final AttendanceService attendanceService;

    public MeController(UserRepository userRepository, EmployeeService employeeService,
                        AttendanceService attendanceService) {
        this.userRepository = userRepository;
        this.employeeService = employeeService;
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public EmployeeResponse myProfile(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        if (user.getEmployeeId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No employee profile is linked to this account");
        }
        return employeeService.findById(user.getEmployeeId());
    }

    @GetMapping("/attendance")
    public List<AttendanceRecordResponse> recentAttendance(Authentication authentication) {
        return attendanceService.recentAttendance(employeeId(authentication));
    }

    @PostMapping("/attendance/check-in")
    public AttendanceRecordResponse checkIn(Authentication authentication) {
        return attendanceService.checkIn(employeeId(authentication));
    }

    @PostMapping("/attendance/check-out")
    public AttendanceRecordResponse checkOut(Authentication authentication) {
        return attendanceService.checkOut(employeeId(authentication));
    }

    private Long employeeId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        if (user.getEmployeeId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No employee profile is linked to this account");
        }
        return user.getEmployeeId();
    }
}