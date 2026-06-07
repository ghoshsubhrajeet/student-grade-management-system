package edu.pasadena.grademanager.controller;

import edu.pasadena.grademanager.model.*;
import edu.pasadena.grademanager.repository.*;
import edu.pasadena.grademanager.service.CsvIngestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/grades")
public class GradeController {

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CsvIngestionService csvIngestionService;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getAllGrades() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.TEACHER) {
            List<Grade> grades = gradeRepository.findAll();
            return ResponseEntity.ok(grades);
        } else if (currentUser.getRole() == Role.STUDENT) {
            Optional<Student> studentOpt = studentRepository.findByEmail(currentUser.getUsername());
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student profile not found for user: " + currentUser.getUsername());
            }
            List<Grade> grades = gradeRepository.findByStudent(studentOpt.get());
            return ResponseEntity.ok(grades);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> getGradesByStudentId(@PathVariable Long studentId) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
        }
        List<Grade> grades = gradeRepository.findByStudent(studentOpt.get());
        return ResponseEntity.ok(grades);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> updateGrade(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Optional<Grade> gradeOpt = gradeRepository.findById(id);
        if (gradeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Grade grade = gradeOpt.get();

        if (updates.containsKey("score")) {
            try {
                double score = Double.parseDouble(updates.get("score").toString());
                if (score < 0 || score > grade.getAssignment().getMaxPoints()) {
                    return ResponseEntity.badRequest().body("Error: Score must be non-negative and less than or equal to max points (" + grade.getAssignment().getMaxPoints() + ").");
                }
                grade.setScore(score);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Error: Invalid score format.");
            }
        }

        if (updates.containsKey("feedback")) {
            grade.setFeedback(updates.get("feedback").toString());
        }

        Grade updatedGrade = gradeRepository.save(grade);
        return ResponseEntity.ok(updatedGrade);
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> importCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: File is empty.");
        }

        try {
            List<String> logs = csvIngestionService.ingestCsv(file);
            return ResponseEntity.ok(Map.of(
                    "message", "CSV processing completed.",
                    "logs", logs
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error parsing CSV file: " + e.getMessage());
        }
    }
}
