package edu.pasadena.grademanager.controller;

import edu.pasadena.grademanager.model.*;
import edu.pasadena.grademanager.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SecurityAccessControlTest {

    @Autowired
    private MockMvc mockMvc;

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

    private User adminUser;
    private User teacherUser;
    private User studentUser1;
    private User studentUser2;
    private Student studentProfile1;
    private Student studentProfile2;

    @BeforeEach
    public void setup() {
        gradeRepository.deleteAll();
        assignmentRepository.deleteAll();
        courseRepository.deleteAll();
        studentRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Users
        adminUser = User.builder().username("admin_test").password("password").role(Role.ADMIN).build();
        teacherUser = User.builder().username("teacher_test").password("password").role(Role.TEACHER).build();
        studentUser1 = User.builder().username("alice@test.edu").password("password").role(Role.STUDENT).build();
        studentUser2 = User.builder().username("bob@test.edu").password("password").role(Role.STUDENT).build();

        userRepository.save(adminUser);
        userRepository.save(teacherUser);
        userRepository.save(studentUser1);
        userRepository.save(studentUser2);

        // 2. Create Student Profiles
        studentProfile1 = Student.builder()
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@test.edu")
                .phoneNumber("111-222-3333")
                .address("123 Elm St")
                .build();

        studentProfile2 = Student.builder()
                .firstName("Bob")
                .lastName("Jones")
                .email("bob@test.edu")
                .phoneNumber("444-555-6666")
                .address("456 Oak St")
                .build();

        studentRepository.save(studentProfile1);
        studentRepository.save(studentProfile2);
    }

    @Test
    public void testGetStudentsUnauthenticated() throws Exception {
        // In Spring Security 7.x, unauthenticated endpoints return 401 or 403 based on configuration
        mockMvc.perform(get("/api/students"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testGetStudentsAsAdmin() throws Exception {
        mockMvc.perform(get("/api/students").with(user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    public void testGetGradesAsAdmin() throws Exception {
        Course course = Course.builder().courseCode("CS101").courseName("Intro").build();
        courseRepository.save(course);
        Assignment assignment = Assignment.builder().course(course).title("HW1").maxPoints(100.0).build();
        assignmentRepository.save(assignment);
        Grade grade = Grade.builder().student(studentProfile1).assignment(assignment).score(90.0).feedback("Good").build();
        gradeRepository.save(grade);

        mockMvc.perform(get("/api/grades").with(user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }


    @Test
    public void testGetStudentsAsTeacher() throws Exception {
        mockMvc.perform(get("/api/students").with(user(teacherUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    public void testGetStudentsAsStudentOwnProfileOnly() throws Exception {
        mockMvc.perform(get("/api/students").with(user(studentUser1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].firstName", is("Alice")));
    }

    @Test
    public void testTeacherCannotModifySensitiveFields() throws Exception {
        String updatePayload = "{" +
                "\"firstName\":\"Alice\"," +
                "\"lastName\":\"Smith\"," +
                "\"email\":\"alice@test.edu\"," +
                "\"phoneNumber\":\"999-999-9999\"," + // Modified phoneNumber
                "\"address\":\"123 Elm St\"" +
                "}";

        mockMvc.perform(put("/api/students/" + studentProfile1.getId())
                        .with(user(teacherUser))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isForbidden())
                .andExpect(content().string(is("Access Denied: Only Admin users can modify Address and Phone Number.")));
    }

    @Test
    public void testAdminCanModifySensitiveFields() throws Exception {
        String updatePayload = "{" +
                "\"firstName\":\"Alice\"," +
                "\"lastName\":\"Smith\"," +
                "\"email\":\"alice@test.edu\"," +
                "\"phoneNumber\":\"999-999-9999\"," +
                "\"address\":\"999 New Address Rd\"" +
                "}";

        mockMvc.perform(put("/api/students/" + studentProfile1.getId())
                        .with(user(adminUser))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phoneNumber", is("999-999-9999")))
                .andExpect(jsonPath("$.address", is("999 New Address Rd")));
    }

    @Test
    public void testStudentCannotUpdateStudentDetails() throws Exception {
        String updatePayload = "{" +
                "\"firstName\":\"AliceNew\"," +
                "\"lastName\":\"Smith\"," +
                "\"email\":\"alice@test.edu\"" +
                "}";

        mockMvc.perform(put("/api/students/" + studentProfile1.getId())
                        .with(user(studentUser1))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAdminCanDeleteStudent() throws Exception {
        mockMvc.perform(delete("/api/students/" + studentProfile1.getId())
                        .with(user(adminUser))
                        .with(csrf()))
                .andExpect(status().isOk());

        assertFalse(studentRepository.findById(studentProfile1.getId()).isPresent());
    }

    @Test
    public void testTeacherCannotDeleteStudent() throws Exception {
        mockMvc.perform(delete("/api/students/" + studentProfile1.getId())
                        .with(user(teacherUser))
                        .with(csrf()))
                .andExpect(status().isForbidden());

        assertTrue(studentRepository.findById(studentProfile1.getId()).isPresent());
    }
}
