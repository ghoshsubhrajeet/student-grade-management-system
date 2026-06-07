package edu.pasadena.grademanager.repository;

import edu.pasadena.grademanager.model.Student;
import edu.pasadena.grademanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    Optional<Student> findByUser(User user);
}
