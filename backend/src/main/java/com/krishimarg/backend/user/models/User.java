package com.krishimarg.backend.user.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "role", length = 20, nullable = false)
    private String role; // 'FARMER', 'BUYER', 'DRIVER'

    @Column(name = "default_lat")
    private Double defaultLat;

    @Column(name = "default_lng")
    private Double defaultLng;

    public User() {
    }

    public User(String userId, String fullName, String role, Double defaultLat, Double defaultLng) {
        this.userId = userId;
        this.fullName = fullName;
        this.role = role;
        this.defaultLat = defaultLat;
        this.defaultLng = defaultLng;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Double getDefaultLat() {
        return defaultLat;
    }

    public void setDefaultLat(Double defaultLat) {
        this.defaultLat = defaultLat;
    }

    public Double getDefaultLng() {
        return defaultLng;
    }

    public void setDefaultLng(Double defaultLng) {
        this.defaultLng = defaultLng;
    }
}
