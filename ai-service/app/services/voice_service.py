import os
import asyncio
import io
import hashlib
import time
from typing import Optional, List, Dict


class VoiceService:
    def __init__(self):
        self.provider = os.getenv("STT_PROVIDER", "mock")
        self.tts_provider = os.getenv("TTS_PROVIDER", "mock")
        self.deepgram_api_key = os.getenv("DEEPGRAM_API_KEY", "")
        self.elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY", "")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", os.getenv("LLM_API_KEY", "")))
        # In-memory cache: text_hash -> audio_bytes (avoids re-synthesizing same text)
        self._cache: Dict[str, bytes] = {}
        self._cache_max = 200

    def _cache_key(self, text: str, voice: str) -> str:
        return hashlib.md5(f"{text}:{voice}".encode()).hexdigest()

    async def transcribe(self, audio_data: bytes) -> str:
        if self.provider == "mock":
            return self._mock_transcribe()
        if self.provider == "deepgram":
            return await self._transcribe_deepgram(audio_data)
        if self.provider == "whisper":
            return await self._transcribe_whisper(audio_data)
        return self._mock_transcribe()

    async def synthesize(self, text: str, voice: str = "en-US-GuyNeural", rate: float = 0.9) -> bytes:
        # Check cache first
        key = self._cache_key(text, voice)
        if key in self._cache:
            print(f"[VoiceService] Cache hit for: {text[:40]}...")
            return self._cache[key]

        result = b""

        # Edge-tts: primary (free, unlimited, fast, natural male voice)
        result = await self._synthesize_edge(text, voice, rate)
        if result and len(result) > 100:
            self._cache_put(key, result)
            return result

        # Gemini TTS: quality upgrade when available (limited to 10/day free tier)
        if self.gemini_api_key:
            result = await self._synthesize_gemini(text)
            if result and len(result) > 100:
                self._cache_put(key, result)
                return result

        return self._mock_synthesize()

    def _cache_put(self, key: str, value: bytes):
        if len(self._cache) >= self._cache_max:
            # Remove oldest entry
            oldest = next(iter(self._cache))
            del self._cache[oldest]
        self._cache[key] = value

    def _mock_transcribe(self) -> str:
        return "This is a mock transcription of the candidate's response."

    def _mock_synthesize(self) -> bytes:
        return b""

    async def _transcribe_deepgram(self, audio_data: bytes) -> str:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.deepgram.com/v1/listen",
                    headers={
                        "Authorization": f"Token {self.deepgram_api_key}",
                        "Content-Type": "audio/webm",
                    },
                    content=audio_data,
                    params={"model": "nova-2", "language": "en", "smart_format": "true"},
                    timeout=30.0,
                )
                if response.status_code == 200:
                    result = response.json()
                    return result["results"]["channels"][0]["alternatives"][0]["transcript"]
        except Exception as e:
            print(f"Deepgram transcription error: {e}")
        return self._mock_transcribe()

    async def _transcribe_whisper(self, audio_data: bytes) -> str:
        try:
            import httpx
            openai_api_key = os.getenv("OPENAI_API_KEY", "")
            if not openai_api_key:
                return self._mock_transcribe()
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {openai_api_key}"},
                    files={"file": ("audio.webm", audio_data, "audio/webm")},
                    data={"model": "whisper-1"},
                    timeout=60.0,
                )
                if response.status_code == 200:
                    return response.json()["text"]
        except Exception as e:
            print(f"Whisper transcription error: {e}")
        return self._mock_transcribe()

    async def _synthesize_gemini(self, text: str) -> bytes:
        """Gemini 2.5 Flash TTS - high quality, male voice (Puck). Returns empty on rate limit."""
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.gemini_api_key)

            response = client.models.generate_content(
                model="gemini-2.5-flash-preview-tts",
                contents=text,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name="Puck"
                            )
                        )
                    ),
                ),
            )

            if response.candidates and len(response.candidates) > 0:
                parts = response.candidates[0].content.parts
                for part in parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        return self._pcm_to_wav(part.inline_data.data, sample_rate=24000, channels=1, sample_width=2)
                    if hasattr(part, 'audio') and part.audio:
                        return self._pcm_to_wav(part.audio, sample_rate=24000, channels=1, sample_width=2)

        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                print(f"[VoiceService] Gemini rate limited - will use edge-tts")
            else:
                print(f"Gemini TTS error: {e}")

        return b""

    def _pcm_to_wav(self, pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, sample_width: int = 2) -> bytes:
        import struct
        import io

        data_size = len(pcm_data)
        output = io.BytesIO()

        output.write(b'RIFF')
        output.write(struct.pack('<I', 36 + data_size))
        output.write(b'WAVE')
        output.write(b'fmt ')
        output.write(struct.pack('<I', 16))
        output.write(struct.pack('<H', 1))
        output.write(struct.pack('<H', channels))
        output.write(struct.pack('<I', sample_rate))
        output.write(struct.pack('<I', sample_rate * channels * sample_width))
        output.write(struct.pack('<H', channels * sample_width))
        output.write(struct.pack('<H', sample_width * 8))
        output.write(b'data')
        output.write(struct.pack('<I', data_size))
        output.write(pcm_data)

        return output.getvalue()

    async def _synthesize_edge(self, text: str, voice: str, rate: float) -> bytes:
        try:
            import edge_tts

            adjusted_rate = max(0.85, min(rate, 1.1))
            rate_pct = int((adjusted_rate - 1) * 100)
            rate_str = f"+{rate_pct}%" if rate_pct >= 0 else f"{rate_pct}%"

            communicate = edge_tts.Communicate(
                text,
                "en-US-AndrewNeural",
                rate=rate_str,
                pitch="+0Hz"
            )

            audio_buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.write(chunk["data"])

            return audio_buffer.getvalue()
        except Exception as e:
            print(f"Edge TTS error: {e}")

        return self._mock_synthesize()

    async def _synthesize_elevenlabs(self, text: str, voice: str) -> bytes:
        try:
            import httpx
            voice_map = {
                "en-US-AriaNeural": "21m00Tcm4TlvDq8ikWAM",
                "en-US-JennyNeural": "EXAVITQu4vr4xnSDxMaL",
                "en-US-GuyNeural": "pNInz6obpgDQGcFmaJgB",
                "en-GB-SoniaNeural": "EXAVITQu4vr4xnSDxMaL",
                "en-IN-NeerjaNeural": "21m00Tcm4TlvDq8ikWAM",
            }
            voice_id = voice_map.get(voice, "21m00Tcm4TlvDq8ikWAM")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                    headers={"xi-api-key": self.elevenlabs_api_key, "Content-Type": "application/json"},
                    json={"text": text, "model_id": "eleven_monolingual_v1"},
                    timeout=30.0,
                )
                if response.status_code == 200:
                    return response.content
                else:
                    print(f"ElevenLabs TTS error: HTTP {response.status_code} - {response.text[:200]}")
        except Exception as e:
            print(f"ElevenLabs TTS error: {e}")
        return self._mock_synthesize()

    def get_available_voices(self) -> List[Dict[str, str]]:
        return [
            {"id": "en-US-AndrewNeural", "name": "Andrew (Natural Male)", "language": "en-US"},
            {"id": "en-US-GuyNeural", "name": "Guy (Male)", "language": "en-US"},
            {"id": "en-US-JennyNeural", "name": "Jenny (Female)", "language": "en-US"},
            {"id": "en-US-AriaNeural", "name": "Aria (Female)", "language": "en-US"},
            {"id": "en-GB-SoniaNeural", "name": "Sonia (British Female)", "language": "en-GB"},
            {"id": "en-IN-NeerjaNeural", "name": "Neerja (Indian Female)", "language": "en-IN"},
        ]
