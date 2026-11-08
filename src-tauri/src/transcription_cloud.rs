//! Cloud speech-to-text through an OpenAI-compatible API (Groq by default):
//! `POST {base_url}/audio/transcriptions`, or `/audio/translations` when
//! translating to English.

use crate::settings::{AppSettings, TranscriptionProvider};
use anyhow::{anyhow, Result};
use hound::{SampleFormat, WavSpec, WavWriter};
use log::{debug, error};
use reqwest::multipart::{Form, Part};
use serde_json::Value;
use std::io::Cursor;
use std::sync::OnceLock;
use std::time::Duration;

/// Recorded audio is 16 kHz mono.
const SAMPLE_RATE: u32 = 16_000;

pub struct CloudTranscriptionRequest {
    pub audio: Vec<f32>,
    pub api_key: String,
    pub model: String,
    pub provider: TranscriptionProvider,
    /// ISO-639-1 code, or `None` to let the provider detect it.
    pub language: Option<String>,
    pub translate_to_english: bool,
}

impl CloudTranscriptionRequest {
    /// The request the current settings describe, or why they can't make one.
    pub fn from_settings(settings: &AppSettings, audio: Vec<f32>) -> Result<Self> {
        let provider = settings
            .active_transcription_provider()
            .cloned()
            .ok_or_else(|| anyhow!("No cloud transcription provider is configured."))?;

        let api_key = settings
            .transcription_api_keys
            .get(&provider.id)
            .map(|key| key.trim().to_string())
            .unwrap_or_default();
        if api_key.is_empty() {
            return Err(anyhow!("Cloud transcription requires an API key."));
        }

        let model = settings
            .transcription_models
            .get(&provider.id)
            .map(|model| model.trim().to_string())
            .unwrap_or_default();
        if model.is_empty() {
            return Err(anyhow!("Cloud transcription requires a model selection."));
        }

        Ok(Self {
            audio,
            api_key,
            model,
            provider,
            language: cloud_language(&settings.selected_language),
            translate_to_english: settings.translate_to_english,
        })
    }
}

/// The provider's language hint for a stored language intent: `None` for
/// auto, otherwise the base ISO-639-1 code (`zh` for `zh-Hans`, `pt` for
/// `pt-BR`), which is what Whisper-style APIs accept.
pub fn cloud_language(selected_language: &str) -> Option<String> {
    let base = selected_language
        .split(['-', '_'])
        .next()
        .unwrap_or_default()
        .trim();
    if base.is_empty() || base.eq_ignore_ascii_case("auto") {
        None
    } else {
        Some(base.to_ascii_lowercase())
    }
}

pub async fn transcribe_with_cloud(request: CloudTranscriptionRequest) -> Result<String> {
    let wav_bytes = encode_wav(&request.audio)?;

    let mut form = Form::new().text("model", request.model).part(
        "file",
        Part::bytes(wav_bytes)
            .file_name("audio.wav")
            .mime_str("audio/wav")?,
    );

    if let Some(language) = request.language {
        form = form.text("language", language);
    }

    let endpoint = if request.translate_to_english {
        "audio/translations"
    } else {
        "audio/transcriptions"
    };

    let base_url = request.provider.base_url.trim_end_matches('/');
    let url = format!("{}/{}", base_url, endpoint);

    debug!("Sending cloud transcription request to: {}", url);

    let response = shared_client()?
        .post(url)
        .bearer_auth(request.api_key)
        .multipart(form)
        .send()
        .await?;

    let status = response.status();
    let body = response.text().await?;

    if !status.is_success() {
        error!("Cloud transcription failed ({}): {}", status.as_u16(), body);
        return Err(anyhow!(
            "Cloud transcription failed ({}): {}",
            status.as_u16(),
            body
        ));
    }

    parse_transcription_text(&body)
}

/// The `text` of an OpenAI-style transcription response.
fn parse_transcription_text(body: &str) -> Result<String> {
    let parsed: Value = serde_json::from_str(body)?;
    Ok(parsed
        .get("text")
        .and_then(|v| v.as_str())
        .unwrap_or_default()
        .trim()
        .to_string())
}

/// 16-bit PCM WAV of `samples`, built in memory so no recording is written to
/// the temp directory.
fn encode_wav(samples: &[f32]) -> Result<Vec<u8>> {
    let spec = WavSpec {
        channels: 1,
        sample_rate: SAMPLE_RATE,
        bits_per_sample: 16,
        sample_format: SampleFormat::Int,
    };
    let mut cursor = Cursor::new(Vec::with_capacity(44 + samples.len() * 2));
    {
        let mut writer = WavWriter::new(&mut cursor, spec)?;
        for sample in samples {
            let clamped = sample.clamp(-1.0, 1.0);
            writer.write_sample((clamped * i16::MAX as f32) as i16)?;
        }
        writer.finalize()?;
    }
    Ok(cursor.into_inner())
}

/// Process-wide client, so dictations reuse the provider connection.
fn shared_client() -> Result<&'static reqwest::Client> {
    static SHARED: OnceLock<reqwest::Client> = OnceLock::new();
    if let Some(client) = SHARED.get() {
        return Ok(client);
    }
    let client = reqwest::Client::builder()
        .pool_idle_timeout(Duration::from_secs(30))
        .tcp_keepalive(Duration::from_secs(15))
        .connect_timeout(Duration::from_secs(10))
        .timeout(Duration::from_secs(120))
        .build()?;
    Ok(SHARED.get_or_init(|| client))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn language_hint_uses_base_code() {
        assert_eq!(cloud_language("auto"), None);
        assert_eq!(cloud_language(""), None);
        assert_eq!(cloud_language("en"), Some("en".to_string()));
        assert_eq!(cloud_language("zh-Hans"), Some("zh".to_string()));
        assert_eq!(cloud_language("pt-BR"), Some("pt".to_string()));
    }

    #[test]
    fn wav_has_header_and_samples() {
        let wav = encode_wav(&[0.0, 0.5, -0.5, 1.5]).unwrap();
        assert_eq!(&wav[0..4], b"RIFF");
        assert_eq!(&wav[8..12], b"WAVE");
        assert_eq!(wav.len(), 44 + 4 * 2);
    }

    #[test]
    fn parses_text_field() {
        assert_eq!(
            parse_transcription_text(r#"{"text":" hello world "}"#).unwrap(),
            "hello world"
        );
        assert_eq!(parse_transcription_text(r#"{"x_groq":{}}"#).unwrap(), "");
        assert!(parse_transcription_text("not json").is_err());
    }

    #[test]
    fn request_requires_key_and_model() {
        let mut settings = crate::settings::get_default_settings();
        settings.transcription_mode = crate::settings::TranscriptionMode::Cloud;
        assert!(CloudTranscriptionRequest::from_settings(&settings, vec![]).is_err());

        settings
            .transcription_api_keys
            .insert("groq".to_string(), " key ".to_string());
        let request = CloudTranscriptionRequest::from_settings(&settings, vec![]).unwrap();
        assert_eq!(request.api_key, "key");
        assert_eq!(request.model, "whisper-large-v3-turbo");
        assert_eq!(request.provider.id, "groq");

        settings
            .transcription_models
            .insert("groq".to_string(), String::new());
        assert!(CloudTranscriptionRequest::from_settings(&settings, vec![]).is_err());
    }
}
