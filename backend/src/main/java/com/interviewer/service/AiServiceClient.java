package com.interviewer.service;

import com.interviewer.entity.Interview;
import com.interviewer.entity.InterviewSession;
import com.interviewer.entity.Evaluation;
import com.interviewer.entity.JobDescription;
import com.interviewer.entity.Question;
import com.interviewer.entity.Resume;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiServiceClient {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Question> generateQuestions(JobDescription jd, Resume resume, int count) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("job_description", jd.getDescription());
            request.put("resume_text", resume != null ? resume.getExtractedText() : "");
            request.put("count", count);
            request.put("experience_level", jd.getExperienceLevel().name());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<List> response = restTemplate.exchange(
                    aiServiceUrl + "/ai/generate-questions",
                    HttpMethod.POST,
                    entity,
                    List.class
            );

            if (response.getBody() != null) {
                List<Question> questions = new ArrayList<>();
                for (Object item : response.getBody()) {
                    if (item instanceof Map) {
                        Map<String, Object> map = (Map<String, Object>) item;
                        Question question = Question.builder()
                                .text((String) map.get("text"))
                                .type(Question.Type.valueOf((String) map.getOrDefault("type", "TECHNICAL")))
                                .difficulty(Question.Difficulty.valueOf((String) map.getOrDefault("difficulty", "MEDIUM")))
                                .expectedAnswer((String) map.get("expected_answer"))
                                .build();
                        questions.add(question);
                    }
                }
                return questions;
            }
        } catch (Exception e) {
            // Log error and return empty list
        }
        return Collections.emptyList();
    }

    public String generateFollowUp(String question, String answer) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("question", question);
            request.put("answer", answer);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    aiServiceUrl + "/ai/generate-followup",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getBody() != null) {
                return (String) response.getBody().get("follow_up");
            }
        } catch (Exception e) {
            // Log error
        }
        return null;
    }

    public Map<String, Object> evaluateAnswer(String question, String answer, String expectedAnswer) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("question", question);
            request.put("answer", answer);
            request.put("expected_answer", expectedAnswer);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    aiServiceUrl + "/ai/evaluate-answer",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    public Map<String, Object> generateReport(Interview interview) {
        try {
            // Gather all evaluations for this interview
            List<InterviewSession> sessions = interview.getSessions();
            List<Map<String, Object>> evaluations = new ArrayList<>();
            int totalScore = 0;
            int count = 0;

            for (InterviewSession session : sessions) {
                if (session.getEvaluation() != null) {
                    Evaluation eval = session.getEvaluation();
                    Map<String, Object> evalMap = new HashMap<>();
                    evalMap.put("question", session.getQuestion().getText());
                    evalMap.put("answer", session.getCandidateAnswer());
                    evalMap.put("score", eval.getScore());
                    evalMap.put("grade", eval.getGrade());
                    evalMap.put("feedback", eval.getFeedback());
                    evalMap.put("sample_response", eval.getSampleResponse() != null ? eval.getSampleResponse() : "");
                    evalMap.put("strengths", eval.getStrengths());
                    evalMap.put("weaknesses", eval.getWeaknesses());
                    evaluations.add(evalMap);
                    totalScore += eval.getScore();
                    count++;
                }
            }

            Map<String, Object> request = new HashMap<>();
            request.put("interview_id", interview.getId());
            request.put("evaluations", evaluations);
            request.put("average_score", count > 0 ? totalScore / count : 0);
            request.put("total_questions", sessions.size());
            request.put("answered_questions", count);
            request.put("job_description", interview.getJobDescription() != null ? interview.getJobDescription().getTitle() : "");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    aiServiceUrl + "/ai/generate-report",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    public Map<String, Object> parseResume(String resumeText) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("resume_text", resumeText);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    aiServiceUrl + "/ai/parse-resume",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    public Map<String, Object> analyzeJobDescription(String jdText) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("job_description", jdText);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    aiServiceUrl + "/ai/analyze-jd",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }
}
