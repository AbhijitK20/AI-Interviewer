package com.interviewer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewer.entity.Resume;
import com.interviewer.entity.User;
import com.interviewer.repository.ResumeRepository;
import com.interviewer.repository.UserRepository;
import com.interviewer.security.JwtUtil;
import com.interviewer.service.AiServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    private String toJson(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "text", required = false) String directText) {
        try {
            Long userId = getCurrentUserId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Resume resume = Resume.builder()
                    .user(user)
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(String.valueOf(file.getSize()))
                    .status(Resume.Status.UPLOADED)
                    .build();

            if (directText != null && !directText.isEmpty()) {
                resume.setExtractedText(directText);
                resume.setStatus(Resume.Status.PARSING);
            } else {
                // Store file and extract text
                String uploadDir = "uploads/resumes/";
                Files.createDirectories(Paths.get(uploadDir));
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                Files.copy(file.getInputStream(), filePath);
                resume.setFilePath(filePath.toString());

                // Try to extract text from the file content
                String textContent = new String(file.getBytes());
                resume.setExtractedText(textContent);
                resume.setStatus(Resume.Status.PARSING);
            }

            // Parse the resume
            try {
                Map<String, Object> parsed = aiServiceClient.parseResume(
                        resume.getExtractedText() != null ? resume.getExtractedText() : ""
                );
                resume.setParsedData(parsed != null ? toJson(parsed) : null);
                resume.setStatus(Resume.Status.PARSED);
            } catch (Exception e) {
                resume.setStatus(Resume.Status.FAILED);
                resume.setErrorMessage(e.getMessage());
            }

            resume = resumeRepository.save(resume);

            Map<String, Object> response = new HashMap<>();
            response.put("id", resume.getId());
            response.put("fileName", resume.getFileName());
            response.put("status", resume.getStatus().name());
            response.put("parsedData", resume.getParsedData());
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/parse-text")
    public ResponseEntity<?> parseResumeText(@RequestBody Map<String, String> request) {
        try {
            Long userId = getCurrentUserId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String text = request.get("text");
            if (text == null || text.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
            }

            Map<String, Object> parsed = aiServiceClient.parseResume(text);

            Resume resume = Resume.builder()
                    .user(user)
                    .fileName("pasted-resume.txt")
                    .filePath("pasted")
                    .fileType("text/plain")
                    .extractedText(text)
                    .parsedData(parsed != null ? toJson(parsed) : null)
                    .status(Resume.Status.PARSED)
                    .build();
            resume = resumeRepository.save(resume);

            Map<String, Object> response = new HashMap<>();
            response.put("id", resume.getId());
            response.put("parsedData", parsed);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getUserResumes() {
        Long userId = getCurrentUserId();
        List<Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> response = resumes.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("fileName", r.getFileName());
            map.put("status", r.getStatus().name());
            map.put("parsedData", r.getParsedData());
            map.put("createdAt", r.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<?> getResume(@PathVariable Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", resume.getId());
        response.put("fileName", resume.getFileName());
        response.put("extractedText", resume.getExtractedText());
        response.put("parsedData", resume.getParsedData());
        response.put("status", resume.getStatus().name());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<?> deleteResume(@PathVariable Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        resumeRepository.delete(resume);
        return ResponseEntity.ok(Map.of("message", "Resume deleted"));
    }

    private Long getCurrentUserId() {
        org.springframework.web.context.request.RequestAttributes attrs =
                org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
        if (attrs instanceof org.springframework.web.context.request.ServletRequestAttributes servletAttrs) {
            String auth = servletAttrs.getRequest().getHeader("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                try {
                    return jwtUtil.extractUserId(auth.substring(7));
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }
}
