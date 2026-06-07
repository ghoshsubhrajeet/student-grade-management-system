package edu.pasadena.grademanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grades", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "assignment_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @Column(nullable = false)
    private Double score;

    @Column(columnDefinition = "TEXT")
    private String feedback;
}
