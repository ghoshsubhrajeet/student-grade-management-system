package edu.pasadena.grademanager.util;

import edu.pasadena.grademanager.model.Role;
import edu.pasadena.grademanager.model.Student;
import edu.pasadena.grademanager.model.User;
import edu.pasadena.grademanager.repository.StudentRepository;
import edu.pasadena.grademanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Admin
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(encoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded admin user: admin / admin123");
        }

        // 2. Seed Teacher
        if (userRepository.findByUsername("teacher").isEmpty()) {
            User teacher = User.builder()
                    .username("teacher")
                    .password(encoder.encode("teacher123"))
                    .role(Role.TEACHER)
                    .build();
            userRepository.save(teacher);
            System.out.println("Seeded teacher user: teacher / teacher123");
        }

        // 3. Seed Student User and Profile
        if (userRepository.findByUsername("student@pasadena.edu").isEmpty()) {
            User studentUser = User.builder()
                    .username("student@pasadena.edu")
                    .password(encoder.encode("student123"))
                    .role(Role.STUDENT)
                    .build();
            studentUser = userRepository.save(studentUser);

            if (studentRepository.findByEmail("student@pasadena.edu").isEmpty()) {
                Student studentProfile = Student.builder()
                        .firstName("John")
                        .lastName("Doe")
                        .email("student@pasadena.edu")
                        .phoneNumber("626-555-0199")
                        .address("1570 E Colorado Blvd, Pasadena, CA 91106")
                        .user(studentUser)
                        .build();
                studentRepository.save(studentProfile);
            }
            System.out.println("Seeded student user: student@pasadena.edu / student123");
        }
    }
}
