package com.interviewer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class VoiceService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${deepgram.api.key:}")
    private String deepgramApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String transcribeAudio(MultipartFile audioFile) {
        try {
            // Try AI service first
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("audio", audioFile.getResource());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                aiServiceUrl + "/ai/transcribe",
                HttpMethod.POST,
                requestEntity,
                Map.class
            );

            if (response.getBody() != null) {
                return (String) response.getBody().get("transcript");
            }
        } catch (Exception e) {
            // Fallback: return empty transcript
        }
        return "";
    }

    public byte[] synthesizeSpeech(String text, String voice, Double rate) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("text", text);
            request.put("voice", voice);
            request.put("rate", rate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(
                aiServiceUrl + "/ai/synthesize",
                HttpMethod.POST,
                entity,
                byte[].class
            );

            return response.getBody();
        } catch (Exception e) {
            return new byte[0];
        }
    }

    public List<Map<String, String>> getAvailableVoices() {
        return Arrays.asList(
            Map.of("id", "en-US-AriaNeural", "name", "Aria (Female)", "language", "en-US"),
            Map.of("id", "en-US-GuyNeural", "name", "Guy (Male)", "language", "en-US"),
            Map.of("id", "en-US-JennyNeural", "name", "Jenny (Female)", "language", "en-US"),
            Map.of("id", "en-GB-SoniaNeural", "name", "Sonia (Female, UK)", "language", "en-GB"),
            Map.of("id", "en-IN-NeerjaNeural", "name", "Neerja (Female, India)", "language", "en-IN")
        );
    }
}
