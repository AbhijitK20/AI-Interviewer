package com.interviewer.controller;

import com.interviewer.service.VoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
public class VoiceController {

    private final VoiceService voiceService;

    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, Object>> transcribeAudio(
            @RequestParam("audio") MultipartFile audioFile) {
        try {
            String transcript = voiceService.transcribeAudio(audioFile);
            return ResponseEntity.ok(Map.of(
                "transcript", transcript,
                "confidence", 0.95,
                "language", "en-US"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "transcript", "",
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/synthesize")
    public ResponseEntity<byte[]> synthesizeSpeech(@RequestBody Map<String, Object> request) {
        String text = (String) request.get("text");
        String voice = (String) request.getOrDefault("voice", "en-US-AriaNeural");
        Double rate = (Double) request.getOrDefault("rate", 1.0);

        try {
            byte[] audioData = voiceService.synthesizeSpeech(text, voice, rate);
            return ResponseEntity.ok()
                .header("Content-Type", "audio/mpeg")
                .body(audioData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/voices")
    public ResponseEntity<Object> getAvailableVoices() {
        return ResponseEntity.ok(voiceService.getAvailableVoices());
    }
}
