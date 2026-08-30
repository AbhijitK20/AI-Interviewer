package com.interviewer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.*;

@Service
public class CodingService {

    @Value("${judge0.api.url:https://ce.judge0.com}")
    private String judge0Url;

    @Value("${judge0.api.key:}")
    private String judge0ApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ExecutorService executor = Executors.newFixedThreadPool(4);

    private record TestCase(String name, String stdin, String expectedOutput) {}

    private record ProblemTests(List<TestCase> cases, boolean caseSensitive) {}

    private static final Map<Integer, ProblemTests> PROBLEM_TEST_CASES = new LinkedHashMap<>();

    static {
        PROBLEM_TEST_CASES.put(1, new ProblemTests(List.of(
            new TestCase("Example 1", "2 7 11 15\n9", "0 1"),
            new TestCase("Example 2", "3 2 4\n6", "1 2"),
            new TestCase("Single pair", "3 3\n6", "0 1")
        ), true));

        PROBLEM_TEST_CASES.put(2, new ProblemTests(List.of(
            new TestCase("Example 1", "hello", "olleh"),
            new TestCase("Example 2", "Hannah", "hannaH"),
            new TestCase("Single char", "a", "a")
        ), true));

        PROBLEM_TEST_CASES.put(3, new ProblemTests(List.of(
            new TestCase("Simple pair", "()", "true"),
            new TestCase("Mixed brackets", "()[]{}", "true"),
            new TestCase("Nested", "{[]}", "true"),
            new TestCase("Invalid order", "(]", "false"),
            new TestCase("Unbalanced", "([)]", "false")
        ), false));

        PROBLEM_TEST_CASES.put(4, new ProblemTests(List.of(
            new TestCase("Example 1", "1 2 4\n1 3 4", "1 1 2 3 4 4"),
            new TestCase("Empty first list", "\n1 2", "1 2"),
            new TestCase("Disjoint ranges", "1 3 5\n2 4 6", "1 2 3 4 5 6")
        ), true));

        PROBLEM_TEST_CASES.put(5, new ProblemTests(List.of(
            new TestCase("Example 1", "3 9 20 null null 15 7", "3;9 20;15 7"),
            new TestCase("Single node", "1", "1"),
            new TestCase("Left skewed", "1 2 null 3", "1;2;3")
        ), true));
    }

    public Map<String, Object> executeCode(Integer languageId, String sourceCode, String stdin) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("language_id", languageId);
            request.put("source_code", sourceCode);
            request.put("stdin", stdin);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!judge0ApiKey.isEmpty()) {
                headers.set("X-Auth-Token", judge0ApiKey);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> submitResponse = restTemplate.exchange(
                judge0Url + "/submissions?base64_encoded=false&wait=true",
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (submitResponse.getBody() != null) {
                return submitResponse.getBody();
            }
        } catch (Exception e) {
            return Map.of(
                "status", Map.of("description", "Error"),
                "stderr", "Code execution service unavailable: " + e.getMessage()
            );
        }

        return Map.of("status", Map.of("description", "Unknown error"));
    }

    public Map<String, Object> submitCode(Long problemId, Integer languageId, String language, String sourceCode) {
        int pid = problemId != null ? problemId.intValue() : 0;
        ProblemTests problemTests = PROBLEM_TEST_CASES.get(pid);
        List<TestCase> testCases = problemTests != null ? problemTests.cases() : List.of();
        boolean caseSensitive = problemTests == null || problemTests.caseSensitive();

        List<Map<String, Object>> testResults;

        if (testCases.isEmpty()) {
            Map<String, Object> executionResult = executeCode(languageId, sourceCode, "");
            boolean passed = executionResult.get("stdout") != null
                && !executionResult.get("stdout").toString().isEmpty();
            testResults = List.of(Map.of(
                "passed", passed,
                "testName", "Basic Test",
                "error", passed ? "" : "No output produced"
            ));
        } else {
            List<Future<Map<String, Object>>> futures = new ArrayList<>();
            for (TestCase tc : testCases) {
                futures.add(executor.submit(() -> runTestCase(languageId, sourceCode, tc, caseSensitive)));
            }

            testResults = new ArrayList<>();
            for (Future<Map<String, Object>> future : futures) {
                try {
                    testResults.add(future.get(60, TimeUnit.SECONDS));
                } catch (TimeoutException e) {
                    testResults.add(Map.of("passed", false, "testName", "Test", "error", "Execution timed out"));
                } catch (Exception e) {
                    testResults.add(Map.of("passed", false, "testName", "Test", "error", "Execution failed"));
                }
            }
        }

        long passedCount = testResults.stream().filter(r -> Boolean.TRUE.equals(r.get("passed"))).count();
        int score = testResults.isEmpty() ? 0 : (int) Math.round(passedCount * 100.0 / testResults.size());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("problemId", pid);
        result.put("language", language);
        result.put("testResults", testResults);
        result.put("passedCount", passedCount);
        result.put("totalTests", testResults.size());
        result.put("score", score);
        return result;
    }

    private Map<String, Object> runTestCase(Integer languageId, String sourceCode, TestCase tc, boolean caseSensitive) {
        Map<String, Object> execution = executeCode(languageId, sourceCode, tc.stdin());

        String statusDescription = "";
        Object status = execution.get("status");
        if (status instanceof Map<?, ?> statusMap && statusMap.get("description") != null) {
            statusDescription = statusMap.get("description").toString();
        }

        String stdout = execution.get("stdout") != null ? execution.get("stdout").toString() : "";
        String stderr = execution.get("stderr") != null ? execution.get("stderr").toString() : "";
        String compileOutput = execution.get("compile_output") != null ? execution.get("compile_output").toString() : "";

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("testName", tc.name());

        if (!compileOutput.isEmpty()) {
            result.put("passed", false);
            result.put("error", "Compilation error: " + truncate(compileOutput));
            return result;
        }

        if (!"Accepted".equalsIgnoreCase(statusDescription) && stdout.isEmpty()) {
            result.put("passed", false);
            result.put("error", statusDescription.isEmpty() ? "Runtime error" : statusDescription
                + (stderr.isEmpty() ? "" : ": " + truncate(stderr)));
            return result;
        }

        String actual = normalize(stdout);
        String expected = normalize(tc.expectedOutput());
        boolean passed = caseSensitive ? actual.equals(expected) : actual.equalsIgnoreCase(expected);
        result.put("passed", passed);
        if (!passed) {
            result.put("expectedOutput", tc.expectedOutput());
            result.put("actualOutput", stdout.trim());
            result.put("error", "Wrong answer");
        } else {
            result.put("error", "");
        }
        return result;
    }

    private String normalize(String output) {
        if (output == null) return "";
        String[] lines = output.trim().split("\\r?\\n");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            if (i > 0) sb.append('\n');
            sb.append(lines[i].strip().replaceAll("\\s+", " "));
        }
        return sb.toString();
    }

    private String truncate(String text) {
        String clean = text == null ? "" : text.trim();
        return clean.length() > 300 ? clean.substring(0, 300) + "..." : clean;
    }

    public List<Map<String, Object>> getSupportedLanguages() {
        return Arrays.asList(
            Map.of("id", 71, "name", "Python", "monacoId", "python"),
            Map.of("id", 62, "name", "Java", "monacoId", "java"),
            Map.of("id", 63, "name", "JavaScript", "monacoId", "javascript"),
            Map.of("id", 54, "name", "C++", "monacoId", "cpp"),
            Map.of("id", 50, "name", "C", "monacoId", "c"),
            Map.of("id", 51, "name", "C#", "monacoId", "csharp"),
            Map.of("id", 60, "name", "Go", "monacoId", "go"),
            Map.of("id", 73, "name", "Rust", "monacoId", "rust"),
            Map.of("id", 74, "name", "TypeScript", "monacoId", "typescript")
        );
    }

    public List<Map<String, Object>> getProblems() {
        return Arrays.asList(
            Map.of(
                "id", 1,
                "title", "Two Sum",
                "difficulty", "EASY",
                "description", "Given an array of integers and a target, print the indices (space-separated) of the two numbers that add up to the target. Input: line 1 = space-separated integers, line 2 = target. Output: two indices separated by a space.",
                "inputFormat", "Line 1: space-separated integers\nLine 2: target",
                "outputFormat", "Two indices separated by a space",
                "examples", List.of(
                    Map.of("input", "2 7 11 15\n9", "output", "0 1"),
                    Map.of("input", "3 2 4\n6", "output", "1 2")
                )
            ),
            Map.of(
                "id", 2,
                "title", "Reverse String",
                "difficulty", "EASY",
                "description", "Read a single line of input and print it reversed.",
                "inputFormat", "A single line of text",
                "outputFormat", "The reversed text",
                "examples", List.of(
                    Map.of("input", "hello", "output", "olleh"),
                    Map.of("input", "Hannah", "output", "hannaH")
                )
            ),
            Map.of(
                "id", 3,
                "title", "Valid Parentheses",
                "difficulty", "MEDIUM",
                "description", "Read a string containing the characters '(', ')', '{', '}', '[' and ']' and print 'true' if the brackets are balanced and correctly nested, otherwise print 'false'.",
                "inputFormat", "A single line containing brackets",
                "outputFormat", "true or false",
                "examples", List.of(
                    Map.of("input", "()[]{}", "output", "true"),
                    Map.of("input", "([)]", "output", "false")
                )
            ),
            Map.of(
                "id", 4,
                "title", "Merge Two Sorted Lists",
                "difficulty", "EASY",
                "description", "Read two sorted lists of integers (one per line, space-separated) and print the merged sorted list, space-separated. An empty line represents an empty list.",
                "inputFormat", "Line 1: first sorted list\nLine 2: second sorted list",
                "outputFormat", "Merged sorted list, space-separated",
                "examples", List.of(
                    Map.of("input", "1 2 4\n1 3 4", "output", "1 1 2 3 4 4"),
                    Map.of("input", "1 3 5\n2 4 6", "output", "1 2 3 4 5 6")
                )
            ),
            Map.of(
                "id", 5,
                "title", "Binary Tree Level Order Traversal",
                "difficulty", "MEDIUM",
                "description", "Read a binary tree given in level order ('null' marks a missing node) and print its level order traversal: values of each level separated by spaces, levels separated by semicolons.",
                "inputFormat", "Level-order node values, 'null' for missing nodes",
                "outputFormat", "Levels separated by ';', values by spaces",
                "examples", List.of(
                    Map.of("input", "3 9 20 null null 15 7", "output", "3;9 20;15 7"),
                    Map.of("input", "1", "output", "1")
                )
            )
        );
    }

    public Map<String, Object> getProblem(Long id) {
        return getProblems().stream()
            .filter(p -> p.get("id").equals(id.intValue()))
            .findFirst()
            .orElse(Map.of("error", "Problem not found"));
    }
}
