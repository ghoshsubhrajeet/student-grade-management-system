package edu.pasadena.grademanager.service;

import edu.pasadena.grademanager.model.*;
import edu.pasadena.grademanager.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class CsvIngestionServiceTest {

    @Autowired
    private CsvIngestionService csvIngestionService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    public void setup() {
        gradeRepository.deleteAll();
        assignmentRepository.deleteAll();
        courseRepository.deleteAll();
        studentRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void testIngestValidCsv() throws Exception {
        String csvContent = "first_name,last_name,email,phone_number,address,course_code,course_name,assignment_title,max_points,score,feedback\n" +
                "Alice,Smith,alice.smith@pasadena.edu,626-555-0101,123 Main St,CIS101,Introduction to CS,Midterm Exam,100,85,Good effort!\n" +
                "Bob,Jones,bob.jones@pasadena.edu,,456 Oak Ave,CIS101,Introduction to CS,Midterm Exam,100,92,Excellent work!\n";

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "grades.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        List<String> logs = csvIngestionService.ingestCsv(file);

        // Check logs contain creations
        assertNotNull(logs);
        assertTrue(logs.size() > 0);

        // Check student creation
        Optional<Student> aliceOpt = studentRepository.findByEmail("alice.smith@pasadena.edu");
        assertTrue(aliceOpt.isPresent());
        Student alice = aliceOpt.get();
        assertEquals("Alice", alice.getFirstName());
        assertEquals("626-555-0101", alice.getPhoneNumber());
        assertEquals("123 Main St", alice.getAddress());

        // Check associated User creation
        assertNotNull(alice.getUser());
        assertEquals("alice.smith@pasadena.edu", alice.getUser().getUsername());
        assertEquals(Role.STUDENT, alice.getUser().getRole());

        // Check course creation
        Optional<Course> courseOpt = courseRepository.findByCourseCode("CIS101");
        assertTrue(courseOpt.isPresent());
        Course course = courseOpt.get();
        assertEquals("Introduction to CS", course.getCourseName());

        // Check assignment creation
        Optional<Assignment> assignmentOpt = assignmentRepository.findByCourseAndTitle(course, "Midterm Exam");
        assertTrue(assignmentOpt.isPresent());
        Assignment assignment = assignmentOpt.get();
        assertEquals(100.0, assignment.getMaxPoints());

        // Check grade creation for Alice
        Optional<Grade> aliceGradeOpt = gradeRepository.findByStudentAndAssignment(alice, assignment);
        assertTrue(aliceGradeOpt.isPresent());
        Grade aliceGrade = aliceGradeOpt.get();
        assertEquals(85.0, aliceGrade.getScore());
        assertEquals("Good effort!", aliceGrade.getFeedback());

        // Check grade creation for Bob
        Optional<Student> bobOpt = studentRepository.findByEmail("bob.jones@pasadena.edu");
        assertTrue(bobOpt.isPresent());
        Student bob = bobOpt.get();
        Optional<Grade> bobGradeOpt = gradeRepository.findByStudentAndAssignment(bob, assignment);
        assertTrue(bobGradeOpt.isPresent());
        Grade bobGrade = bobGradeOpt.get();
        assertEquals(92.0, bobGrade.getScore());
        assertEquals("Excellent work!", bobGrade.getFeedback());
    }

    @Test
    public void testIngestInvalidCsvRows() throws Exception {
        // Missing required fields on second row and invalid number formats
        String csvContent = "first_name,last_name,email,phone_number,address,course_code,course_name,assignment_title,max_points,score,feedback\n" +
                "Alice,Smith,alice.smith@pasadena.edu,626-555-0101,123 Main St,CIS101,Introduction to CS,Midterm Exam,100,85,Good effort!\n" +
                ",Smith,,626-555-0101,123 Main St,CIS101,Introduction to CS,Midterm Exam,100,85,Good effort!\n" + // empty first_name/email
                "Bob,Jones,bob.jones@pasadena.edu,,456 Oak Ave,CIS101,Introduction to CS,Midterm Exam,abc,92,Excellent work!\n"; // invalid max_points

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "grades.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        List<String> logs = csvIngestionService.ingestCsv(file);

        // Verify we still processed Alice
        assertTrue(studentRepository.findByEmail("alice.smith@pasadena.edu").isPresent());
        
        // Verify Bob was not processed due to NumberFormatException
        assertFalse(studentRepository.findByEmail("bob.jones@pasadena.edu").isPresent());

        // Verify error logs exist
        boolean foundEmptyError = false;
        boolean foundNumberError = false;
        for (String log : logs) {
            if (log.contains("Error - Missing required text fields.")) {
                foundEmptyError = true;
            }
            if (log.contains("Error - Invalid number format")) {
                foundNumberError = true;
            }
        }
        assertTrue(foundEmptyError);
        assertTrue(foundNumberError);
    }
}
