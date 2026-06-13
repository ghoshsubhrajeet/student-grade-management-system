package edu.pasadena.grademanager.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaFallbackController {

    @RequestMapping(value = {
        "/",
        "/{path:[^\\.]*}"
    })
    public String redirect(HttpServletRequest request) {
        String uri = request.getRequestURI();
        // Avoid intercepting backend API endpoints and H2 console
        if (uri.startsWith("/api") || uri.startsWith("/h2-console")) {
            return "forward:/error";
        }
        return "forward:/index.html";
    }
}
