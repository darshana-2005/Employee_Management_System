package com.example.ems.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.ems.dto.AttendanceRecordResponse;
import com.example.ems.entity.AttendanceRecord;
import com.example.ems.entity.Employee;
import com.example.ems.repository.AttendanceRepository;
import com.example.ems.repository.EmployeeRepository;

@Service
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> recentAttendance(Long employeeId) {
        return attendanceRepository.findTop14ByEmployee_IdOrderByWorkDateDesc(employeeId).stream()
                .map(AttendanceRecordResponse::new).collect(Collectors.toList());
    }

    @Transactional
    public AttendanceRecordResponse checkIn(Long employeeId) {
        LocalDate today = LocalDate.now();
        if (attendanceRepository.findByEmployee_IdAndWorkDate(employeeId, today).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already checked in today");
        }
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        return new AttendanceRecordResponse(attendanceRepository.save(
                new AttendanceRecord(employee, today, LocalDateTime.now())));
    }

    @Transactional
    public AttendanceRecordResponse checkOut(Long employeeId) {
        AttendanceRecord record = attendanceRepository.findByEmployee_IdAndWorkDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Check in before checking out"));
        if (record.getCheckOut() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already checked out today");
        }
        record.checkOut(LocalDateTime.now());
        return new AttendanceRecordResponse(attendanceRepository.save(record));
    }
}