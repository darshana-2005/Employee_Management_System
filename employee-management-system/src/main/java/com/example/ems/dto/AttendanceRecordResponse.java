package com.example.ems.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.example.ems.entity.AttendanceRecord;

public class AttendanceRecordResponse {
    private final Long id;
    private final LocalDate workDate;
    private final LocalDateTime checkIn;
    private final LocalDateTime checkOut;

    public AttendanceRecordResponse(AttendanceRecord record) {
        this.id = record.getId();
        this.workDate = record.getWorkDate();
        this.checkIn = record.getCheckIn();
        this.checkOut = record.getCheckOut();
    }

    public Long getId() { return id; }
    public LocalDate getWorkDate() { return workDate; }
    public LocalDateTime getCheckIn() { return checkIn; }
    public LocalDateTime getCheckOut() { return checkOut; }
}