package edu.pasadena.grademanager.controller;

import edu.pasadena.grademanager.model.Role;
import edu.pasadena.grademanager.model.User;
import edu.pasadena.grademanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import edu.pasadena.grademanager.model.Student;
import edu.pasadena.grademanager.model.Grade;
import edu.pasadena.grademanager.repository.StudentRepository;
import edu.pasadena.grademanager.repository.GradeRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private PasswordEncoder encoder;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userOpt.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        if (request.containsKey("password")) {
            user.setPassword(encoder.encode(request.get("password")));
        }

        if (request.containsKey("role")) {
            try {
                Role role = Role.valueOf(request.get("role").toUpperCase());
                user.setRole(role);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error: Invalid role. Must be ADMIN, TEACHER, or STUDENT.");
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok("User updated successfully.");
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        // If the user has the Role of STUDENT, also delete the student profile and their grades
        if (user.getRole() == Role.STUDENT) {
            Optional<Student> studentOpt = studentRepository.findByEmail(user.getUsername());
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                List<Grade> grades = gradeRepository.findByStudent(student);
                gradeRepository.deleteAll(grades);
                studentRepository.delete(student);
            }
        }

        userRepository.delete(user);
        return ResponseEntity.ok("User deleted successfully.");
    }
}
