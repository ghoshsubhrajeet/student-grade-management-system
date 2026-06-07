package edu.pasadena.grademanager.repository;

import edu.pasadena.grademanager.model.Assignment;
import edu.pasadena.grademanager.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourse(Course course);
    Optional<Assignment> findByCourseAndTitle(Course course, String title);
}
