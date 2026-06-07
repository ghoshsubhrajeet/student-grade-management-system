package edu.pasadena.grademanager.controller;

import edu.pasadena.grademanager.model.Role;
import edu.pasadena.grademanager.model.Student;
import edu.pasadena.grademanager.model.User;
import edu.pasadena.grademanager.repository.StudentRepository;
import edu.pasadena.grademanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getAllStudents() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.TEACHER) {
            List<Student> students = studentRepository.findAll();
            return ResponseEntity.ok(students);
        } else if (currentUser.getRole() == Role.STUDENT) {
            Optional<Student> studentOpt = studentRepository.findByUser(currentUser);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Student profile not found for user: " + currentUser.getUsername());
            }
            return ResponseEntity.ok(List.of(studentOpt.get()));
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Optional<Student> studentOpt = studentRepository.findById(id);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
        }

        Student student = studentOpt.get();

        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.TEACHER) {
            return ResponseEntity.ok(student);
        } else if (currentUser.getRole() == Role.STUDENT) {
            if (student.getUser() != null && student.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.ok(student);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access Denied: You can only view your own profile");
            }
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> createStudent(@RequestBody Student student) {
        if (student.getEmail() == null || student.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Email is required.");
        }

        if (studentRepository.findByEmail(student.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email already exists.");
        }

        // If a userId is passed, link it to the user
        if (student.getUser() != null && student.getUser().getId() != null) {
            Optional<User> userOpt = userRepository.findById(student.getUser().getId());
            if (userOpt.isPresent()) {
                student.setUser(userOpt.get());
            }
        }

        Student savedStudent = studentRepository.save(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStudent);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        Optional<Student> studentOpt = studentRepository.findById(id);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student existingStudent = studentOpt.get();
        User currentUser = getCurrentUser();

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 1. Check if modifying sensitive fields: address or phoneNumber
        boolean modifyingAddress = studentDetails.getAddress() != null &&
                !studentDetails.getAddress().equals(existingStudent.getAddress());
        boolean modifyingPhone = studentDetails.getPhoneNumber() != null &&
                !studentDetails.getPhoneNumber().equals(existingStudent.getPhoneNumber());

        if ((modifyingAddress || modifyingPhone) && currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Only Admin users can modify Address and Phone Number.");
        }

        // 2. Perform updates
        existingStudent.setFirstName(studentDetails.getFirstName());
        existingStudent.setLastName(studentDetails.getLastName());
        existingStudent.setEmail(studentDetails.getEmail());

        // Update sensitive fields if they match or if current user is ADMIN
        if (currentUser.getRole() == Role.ADMIN) {
            existingStudent.setAddress(studentDetails.getAddress());
            existingStudent.setPhoneNumber(studentDetails.getPhoneNumber());
        }

        Student updatedStudent = studentRepository.save(existingStudent);
        return ResponseEntity.ok(updatedStudent);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        Optional<Student> studentOpt = studentRepository.findById(id);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        studentRepository.delete(studentOpt.get());
        return ResponseEntity.ok().body("Student profile deleted successfully.");
    }
}
