package edu.pasadena.grademanager.controller;

import edu.pasadena.grademanager.dto.JwtResponse;
import edu.pasadena.grademanager.dto.LoginRequest;
import edu.pasadena.grademanager.model.Role;
import edu.pasadena.grademanager.model.User;
import edu.pasadena.grademanager.repository.UserRepository;
import edu.pasadena.grademanager.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import edu.pasadena.grademanager.dto.ChangePasswordRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User user = (User) authentication.getPrincipal();
        
        return ResponseEntity.ok(new JwtResponse(jwt, user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String roleStr = request.get("role");

        if (username == null || password == null || roleStr == null) {
            return ResponseEntity.badRequest().body("Error: Missing parameters.");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: Invalid role. Must be ADMIN, TEACHER, or STUDENT.");
        }

        User user = User.builder()
                .username(username)
                .password(encoder.encode(password))
                .role(role)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Error: Unauthorized"));
        }

        User user = (User) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findByUsername(user.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Error: User not found"));
        }

        User dbUser = userOpt.get();

        if (!encoder.matches(request.getOldPassword(), dbUser.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Incorrect current password."));
        }

        dbUser.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(dbUser);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
    }
}

