package edu.pasadena.grademanager.service;

import edu.pasadena.grademanager.model.*;
import edu.pasadena.grademanager.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CsvIngestionService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public List<String> ingestCsv(MultipartFile file) throws Exception {
        List<String> logs = new ArrayList<>();
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader,
                     CSVFormat.DEFAULT.builder()
                             .setHeader()
                             .setSkipHeaderRecord(true)
                             .setIgnoreHeaderCase(true)
                             .setTrim(true)
                             .build())) {

            List<CSVRecord> csvRecords = csvParser.getRecords();
            int rowNumber = 1;

            for (CSVRecord csvRecord : csvRecords) {
                rowNumber++;
                try {
                    // Extract fields
                    String firstName = csvRecord.get("first_name");
                    String lastName = csvRecord.get("last_name");
                    String email = csvRecord.get("email");
                    
                    // Optional fields
                    String phoneNumber = "";
                    try {
                        phoneNumber = csvRecord.get("phone_number");
                    } catch (IllegalArgumentException e) {
                        // ignore if column not present
                    }
                    
                    String address = "";
                    try {
                        address = csvRecord.get("address");
                    } catch (IllegalArgumentException e) {
                        // ignore if column not present
                    }

                    String courseCode = csvRecord.get("course_code");
                    String courseName = csvRecord.get("course_name");
                    String assignmentTitle = csvRecord.get("assignment_title");
                    String maxPointsStr = csvRecord.get("max_points");
                    String scoreStr = csvRecord.get("score");
                    
                    String feedback = "";
                    try {
                        feedback = csvRecord.get("feedback");
                    } catch (IllegalArgumentException e) {
                        // ignore if column not present
                    }

                    // Validation
                    if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() || courseCode.isEmpty() || courseName.isEmpty() || assignmentTitle.isEmpty()) {
                        logs.add("Row " + rowNumber + ": Error - Missing required text fields.");
                        continue;
                    }

                    double maxPoints = Double.parseDouble(maxPointsStr);
                    double score = Double.parseDouble(scoreStr);

                    if (maxPoints < 0 || score < 0) {
                        logs.add("Row " + rowNumber + ": Error - Points cannot be negative.");
                        continue;
                    }

                    // 1. Get or Create User & Student
                    Optional<Student> studentOpt = studentRepository.findByEmail(email);
                    Student student;
                    if (studentOpt.isEmpty()) {
                        // Create associated User first
                        User user = User.builder()
                                .username(email)
                                .password(passwordEncoder.encode("pccstudent123")) // default password
                                .role(Role.STUDENT)
                                .build();
                        user = userRepository.save(user);

                        student = Student.builder()
                                .firstName(firstName)
                                .lastName(lastName)
                                .email(email)
                                .phoneNumber(phoneNumber)
                                .address(address)
                                .user(user)
                                .build();
                        student = studentRepository.save(student);
                        logs.add("Row " + rowNumber + ": Created new student " + firstName + " " + lastName + " with account.");
                    } else {
                        student = studentOpt.get();
                        // Update sensitive info if provided
                        boolean updated = false;
                        if (phoneNumber != null && !phoneNumber.isEmpty()) {
                            student.setPhoneNumber(phoneNumber);
                            updated = true;
                        }
                        if (address != null && !address.isEmpty()) {
                            student.setAddress(address);
                            updated = true;
                        }
                        if (updated) {
                            student = studentRepository.save(student);
                        }
                    }

                    // 2. Get or Create Course
                    Optional<Course> courseOpt = courseRepository.findByCourseCode(courseCode);
                    Course course;
                    if (courseOpt.isEmpty()) {
                        course = Course.builder()
                                .courseCode(courseCode)
                                .courseName(courseName)
                                .description("Imported course " + courseName)
                                .build();
                        course = courseRepository.save(course);
                        logs.add("Row " + rowNumber + ": Created new course " + courseCode);
                    } else {
                        course = courseOpt.get();
                    }

                    // 3. Get or Create Assignment
                    Optional<Assignment> assignmentOpt = assignmentRepository.findByCourseAndTitle(course, assignmentTitle);
                    Assignment assignment;
                    if (assignmentOpt.isEmpty()) {
                        assignment = Assignment.builder()
                                .course(course)
                                .title(assignmentTitle)
                                .maxPoints(maxPoints)
                                .build();
                        assignment = assignmentRepository.save(assignment);
                        logs.add("Row " + rowNumber + ": Created new assignment '" + assignmentTitle + "' for course " + courseCode);
                    } else {
                        assignment = assignmentOpt.get();
                    }

                    // 4. Create or Update Grade
                    Optional<Grade> gradeOpt = gradeRepository.findByStudentAndAssignment(student, assignment);
                    Grade grade;
                    if (gradeOpt.isEmpty()) {
                        grade = Grade.builder()
                                .student(student)
                                .assignment(assignment)
                                .score(score)
                                .feedback(feedback)
                                .build();
                        gradeRepository.save(grade);
                        logs.add("Row " + rowNumber + ": Saved grade " + score + "/" + maxPoints + " for " + student.getFirstName());
                    } else {
                        grade = gradeOpt.get();
                        grade.setScore(score);
                        if (feedback != null && !feedback.isEmpty()) {
                            grade.setFeedback(feedback);
                        }
                        gradeRepository.save(grade);
                        logs.add("Row " + rowNumber + ": Updated grade to " + score + "/" + maxPoints + " for " + student.getFirstName());
                    }

                } catch (NumberFormatException e) {
                    logs.add("Row " + rowNumber + ": Error - Invalid number format for max_points or score.");
                } catch (Exception e) {
                    logs.add("Row " + rowNumber + ": Error - " + e.getMessage());
                }
            }
        }
        return logs;
    }
}
