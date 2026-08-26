package com.krishimarg.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String userId;
    private String fullName;
    private String role;
    private Double defaultLat;
    private Double defaultLng;

    public User() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Double getDefaultLat() { return defaultLat; }
    public void setDefaultLat(Double defaultLat) { this.defaultLat = defaultLat; }

    public Double getDefaultLng() { return defaultLng; }
    public void setDefaultLng(Double defaultLng) { this.defaultLng = defaultLng; }
}
