package com.interviewer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QuestionBankService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, List<Map<String, String>>> cache = new ConcurrentHashMap<>();

    private static final Map<String, String> ROLE_FILE_MAP = Map.ofEntries(
        Map.entry("Frontend Developer", "frontend-developer"),
        Map.entry("Backend Developer", "backend-developer"),
        Map.entry("Full Stack Developer", "full-stack-developer"),
        Map.entry("Java Developer", "java-developer"),
        Map.entry("Python Developer", "python-developer"),
        Map.entry("AI/ML Engineer", "ai-ml-engineer"),
        Map.entry("DevOps Engineer", "devops-engineer"),
        Map.entry("Data Engineer", "data-engineer"),
        Map.entry("Data Scientist", "data-scientist"),
        Map.entry("Data Analyst", "data-analyst"),
        Map.entry("Cloud Architect", "cloud-architect"),
        Map.entry("Mobile Developer", "mobile-developer"),
        Map.entry("QA Engineer", "qa-engineer"),
        Map.entry("System Design Architect", "system-design-architect"),
        Map.entry("Cybersecurity Engineer", "cybersecurity-engineer"),
        Map.entry("Product Manager", "product-manager"),
        Map.entry("UI/UX Designer", "ui-ux-designer"),
        Map.entry("Site Reliability Engineer", "site-reliability-engineer"),
        Map.entry("Blockchain Developer", "blockchain-developer"),
        Map.entry("Game Developer", "game-developer")
    );

    public List<Map<String, String>> getQuestionsForRole(String roleTitle, int count) {
        String fileName = ROLE_FILE_MAP.getOrDefault(roleTitle, slugify(roleTitle));
        List<Map<String, String>> allQuestions = loadQuestions(fileName);

        if (allQuestions.isEmpty()) {
            return Collections.emptyList();
        }

        // Shuffle and pick requested count
        List<Map<String, String>> shuffled = new ArrayList<>(allQuestions);
        Collections.shuffle(shuffled);
        return shuffled.subList(0, Math.min(count, shuffled.size()));
    }

    private List<Map<String, String>> loadQuestions(String fileName) {
        return cache.computeIfAbsent(fileName, key -> {
            try {
                ClassPathResource resource = new ClassPathResource("question-banks/" + key + ".json");
                if (!resource.exists()) {
                    System.out.println("Question bank not found: " + key + ".json");
                    return Collections.emptyList();
                }
                InputStream is = resource.getInputStream();
                List<Map<String, String>> questions = objectMapper.readValue(
                    is, new TypeReference<List<Map<String, String>>>() {});
                System.out.println("Loaded " + questions.size() + " questions from " + key + ".json");
                return questions;
            } catch (Exception e) {
                System.out.println("Error loading question bank: " + e.getMessage());
                return Collections.emptyList();
            }
        });
    }

    private String slugify(String title) {
        return title.toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-|-$", "");
    }

    public Set<String> getAvailableRoles() {
        return ROLE_FILE_MAP.keySet();
    }
}
