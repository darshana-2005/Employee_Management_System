package com.example.ems.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.ems.entity.AttendanceRecord;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {
    Optional<AttendanceRecord> findByEmployee_IdAndWorkDate(Long employeeId, LocalDate workDate);
    List<AttendanceRecord> findTop14ByEmployee_IdOrderByWorkDateDesc(Long employeeId);
}