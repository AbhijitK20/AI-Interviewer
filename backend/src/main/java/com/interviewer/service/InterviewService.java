package com.interviewer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewer.dto.*;
import com.interviewer.entity.*;
import com.interviewer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewSessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final EvaluationRepository evaluationRepository;
    private final ReportRepository reportRepository;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    @Transactional
    public InterviewResponse startInterview(Long userId, InterviewStartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobDescription jd = jobDescriptionRepository.findById(request.getJobDescriptionId())
                .orElseThrow(() -> new RuntimeException("Job description not found"));

        Resume resume = null;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new RuntimeException("Resume not found"));
        }

        Interview interview = Interview.builder()
                .candidate(user)
                .jobDescription(jd)
                .resume(resume)
                .title(request.getTitle())
                .mode(Interview.InterviewMode.valueOf(request.getMode()))
                .totalQuestions(request.getTotalQuestions())
                .durationMinutes(request.getDurationMinutes())
                .notes(request.getNotes())
                .status(Interview.Status.SCHEDULED)
                .build();

        interview = interviewRepository.save(interview);

        List<Question> questions = generateQuestions(jd, resume, request.getTotalQuestions());

        List<InterviewSession> sessions = new ArrayList<>();
        for (int i = 0; i < questions.size(); i++) {
            InterviewSession session = InterviewSession.builder()
                    .interview(interview)
                    .question(questions.get(i))
                    .questionOrder(i + 1)
                    .status(InterviewSession.Status.PENDING)
                    .build();
            sessions.add(session);
        }

        sessionRepository.saveAll(sessions);
        interview.setSessions(sessions);

        return mapToInterviewResponse(interview);
    }

    private List<Question> generateQuestions(JobDescription jd, Resume resume, int count) {
        try {
            List<Question> aiQuestions = aiServiceClient.generateQuestions(jd, resume, count);
            if (aiQuestions != null && !aiQuestions.isEmpty()) {
                // Persist AI-generated questions so they can be referenced by sessions
                for (Question q : aiQuestions) {
                    if (q.getActive() == null) {
                        q.setActive(true);
                    }
                }
                return questionRepository.saveAll(aiQuestions);
            }
        } catch (Exception e) {
            // Fallback to database questions
        }

        List<Question> questions = questionRepository.findByActiveTrue();
        return questions.stream().limit(count).collect(Collectors.toList());
    }

    @Transactional
    public InterviewResponse startInterviewSession(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        interview.setStatus(Interview.Status.IN_PROGRESS);
        interview.setStartedAt(LocalDateTime.now());
        interview = interviewRepository.save(interview);

        return mapToInterviewResponse(interview);
    }

    public SessionResponse getNextQuestion(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        int nextOrder = interview.getCurrentQuestionIndex() + 1;
        InterviewSession session = sessionRepository
                .findByInterviewIdAndQuestionOrder(interviewId, nextOrder)
                .orElseThrow(() -> new RuntimeException("No more questions"));

        return mapToSessionResponse(session);
    }

    @Transactional
    public SessionResponse submitAnswer(Long interviewId, AnswerSubmitRequest request) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        InterviewSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setCandidateAnswer(request.getAnswer());
        session.setStatus(InterviewSession.Status.ANSWERED);
        session.setAnsweredAt(LocalDateTime.now());

        try {
            String followUp = aiServiceClient.generateFollowUp(
                    session.getQuestion().getText(),
                    request.getAnswer()
            );
            session.setAiFollowUp(followUp);
        } catch (Exception e) {
            // No follow-up if AI service fails
        }

        session = sessionRepository.save(session);

        // Evaluate the answer and save to DB
        try {
            Map<String, Object> evalResult = aiServiceClient.evaluateAnswer(
                    session.getQuestion().getText(),
                    request.getAnswer(),
                    session.getQuestion().getExpectedAnswer()
            );

            if (evalResult != null && !evalResult.isEmpty()) {
                Evaluation evaluation = Evaluation.builder()
                        .session(session)
                        .score(evalResult.get("score") != null ? ((Number) evalResult.get("score")).intValue() : 0)
                        .grade((String) evalResult.getOrDefault("grade", "F"))
                        .feedback((String) evalResult.getOrDefault("feedback", ""))
                        .skillScores(evalResult.get("skill_scores") != null ? toJson(evalResult.get("skill_scores")) : null)
                        .strengths(evalResult.get("strengths") != null ? toJson(evalResult.get("strengths")) : null)
                        .weaknesses(evalResult.get("weaknesses") != null ? toJson(evalResult.get("weaknesses")) : null)
                        .improvementSuggestions((String) evalResult.get("improvement_suggestions"))
                        .confidenceLevel((String) evalResult.get("confidence_level"))
                        .communicationScore((String) evalResult.get("communication_score"))
                        .technicalDepth((String) evalResult.get("technical_depth"))
                        .build();
                evaluation = evaluationRepository.save(evaluation);
                session.setEvaluation(evaluation);
                session.setStatus(InterviewSession.Status.EVALUATED);
                sessionRepository.save(session);
            }
        } catch (Exception e) {
            // Evaluation failed but answer was saved
        }

        interview.setCurrentQuestionIndex(interview.getCurrentQuestionIndex() + 1);
        interviewRepository.save(interview);

        return mapToSessionResponse(session);
    }

    @Transactional
    public InterviewResponse endInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        interview.setStatus(Interview.Status.COMPLETED);
        interview.setCompletedAt(LocalDateTime.now());
        interview = interviewRepository.save(interview);

        // Generate and save report
        try {
            Map<String, Object> reportData = aiServiceClient.generateReport(interview);
            if (reportData != null && !reportData.isEmpty()) {
                Report report = Report.builder()
                        .interview(interview)
                        .overallScore(reportData.get("overall_score") != null ? ((Number) reportData.get("overall_score")).intValue() : 0)
                        .overallGrade((String) reportData.getOrDefault("overall_grade", "F"))
                        .summary((String) reportData.getOrDefault("summary", ""))
                        .skillRadarData(reportData.get("skill_radar_data") != null ? toJson(reportData.get("skill_radar_data")) : null)
                        .categoryScores(reportData.get("category_scores") != null ? toJson(reportData.get("category_scores")) : null)
                        .strengths(reportData.get("strengths") != null ? toJson(reportData.get("strengths")) : null)
                        .weaknesses(reportData.get("weaknesses") != null ? toJson(reportData.get("weaknesses")) : null)
                        .recommendations((String) reportData.getOrDefault("recommendations", ""))
                        .recommendationLevel((String) reportData.get("recommendation_level"))
                        .questionBreakdown(reportData.get("question_breakdown") != null ? toJson(reportData.get("question_breakdown")) : null)
                        .build();
                reportRepository.save(report);
            }
        } catch (Exception e) {
            // Report generation failed
        }

        return mapToInterviewResponse(interview);
    }

    public List<InterviewResponse> getUserInterviews(Long userId) {
        return interviewRepository.findByCandidateIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToInterviewResponse)
                .collect(Collectors.toList());
    }

    public InterviewResponse getInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        return mapToInterviewResponse(interview);
    }

    private InterviewResponse mapToInterviewResponse(Interview interview) {
        return InterviewResponse.builder()
                .id(interview.getId())
                .title(interview.getTitle())
                .status(interview.getStatus().name())
                .mode(interview.getMode().name())
                .totalQuestions(interview.getTotalQuestions())
                .currentQuestionIndex(interview.getCurrentQuestionIndex())
                .durationMinutes(interview.getDurationMinutes())
                .createdAt(interview.getCreatedAt())
                .startedAt(interview.getStartedAt())
                .completedAt(interview.getCompletedAt())
                .jobDescriptionTitle(interview.getJobDescription() != null ? interview.getJobDescription().getTitle() : null)
                .companyName(interview.getJobDescription() != null ? interview.getJobDescription().getCompany() : null)
                .sessions(interview.getSessions().stream()
                        .map(this::mapToSessionResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private SessionResponse mapToSessionResponse(InterviewSession session) {
        SessionResponse.SessionResponseBuilder builder = SessionResponse.builder()
                .id(session.getId())
                .questionOrder(session.getQuestionOrder())
                .questionText(session.getQuestion().getText())
                .questionType(session.getQuestion().getType().name())
                .difficulty(session.getQuestion().getDifficulty().name())
                .candidateAnswer(session.getCandidateAnswer())
                .aiFollowUp(session.getAiFollowUp())
                .followUpAnswer(session.getFollowUpAnswer())
                .status(session.getStatus().name());

        if (session.getEvaluation() != null) {
            builder.evaluation(EvaluationResponse.builder()
                    .id(session.getEvaluation().getId())
                    .score(session.getEvaluation().getScore())
                    .grade(session.getEvaluation().getGrade())
                    .feedback(session.getEvaluation().getFeedback())
                    .build());
        }

        return builder.build();
    }
}
