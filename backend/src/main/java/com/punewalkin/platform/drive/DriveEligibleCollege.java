package com.punewalkin.platform.drive;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "drive_eligible_colleges")
public class DriveEligibleCollege {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drive_id", nullable = false)
    @JsonIgnore
    private WalkInDrive drive;

    @Column(name = "college_name", nullable = false, length = 200)
    private String collegeName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DriveEligibleCollege() {
    }

    public DriveEligibleCollege(String id, WalkInDrive drive, String collegeName) {
        this.id = id;
        this.drive = drive;
        this.collegeName = collegeName;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public WalkInDrive getDrive() {
        return drive;
    }

    public void setDrive(WalkInDrive drive) {
        this.drive = drive;
    }

    public String getCollegeName() {
        return collegeName;
    }

    public void setCollegeName(String collegeName) {
        this.collegeName = collegeName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
