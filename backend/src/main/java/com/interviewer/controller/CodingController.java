package com.interviewer.controller;

import com.interviewer.service.CodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/coding")
@RequiredArgsConstructor
public class CodingController {

    private final CodingService codingService;

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeCode(@RequestBody Map<String, Object> request) {
        Integer languageId = (Integer) request.get("languageId");
        String sourceCode = (String) request.get("sourceCode");
        String stdin = (String) request.getOrDefault("stdin", "");

        Map<String, Object> result = codingService.executeCode(languageId, sourceCode, stdin);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitCode(@RequestBody Map<String, Object> request) {
        Long problemId = request.get("problemId") != null ?
            Long.valueOf(request.get("problemId").toString()) : null;
        Integer languageId = (Integer) request.get("languageId");
        String language = (String) request.get("language");
        String sourceCode = (String) request.get("sourceCode");

        Map<String, Object> result = codingService.submitCode(problemId, languageId, language, sourceCode);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/languages")
    public ResponseEntity<Object> getSupportedLanguages() {
        return ResponseEntity.ok(codingService.getSupportedLanguages());
    }

    @GetMapping("/problems")
    public ResponseEntity<Object> getProblems() {
        return ResponseEntity.ok(codingService.getProblems());
    }

    @GetMapping("/problems/{id}")
    public ResponseEntity<Object> getProblem(@PathVariable Long id) {
        return ResponseEntity.ok(codingService.getProblem(id));
    }
}
