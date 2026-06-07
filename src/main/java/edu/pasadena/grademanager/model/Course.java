package edu.pasadena.grademanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", unique = true, nullable = false)
    private String courseCode;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
