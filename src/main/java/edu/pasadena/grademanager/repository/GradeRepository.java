package edu.pasadena.grademanager.repository;

import edu.pasadena.grademanager.model.Assignment;
import edu.pasadena.grademanager.model.Grade;
import edu.pasadena.grademanager.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudent(Student student);
    Optional<Grade> findByStudentAndAssignment(Student student, Assignment assignment);
}
