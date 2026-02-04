use crate::audio_toolkit::save_wav_file;
use crate::settings::TranscriptionProvider;
use anyhow::Result;
use log::{debug, error};
use reqwest::multipart::{Form, Part};
use serde_json::Value;
use std::path::PathBuf;

pub struct CloudTranscriptionRequest {
    pub audio: Vec<f32>,
    pub api_key: String,
    pub model: String,
    pub provider: TranscriptionProvider,
    pub language: Option<String>,
    pub translate_to_english: bool,
}

pub async fn transcribe_with_cloud(request: CloudTranscriptionRequest) -> Result<String> {
    let temp_path = build_temp_path();
    save_wav_file(&temp_path, &request.audio).await?;

    let wav_bytes = tokio::fs::read(&temp_path).await?;
    let _ = tokio::fs::remove_file(&temp_path).await;

    let mut form = Form::new()
        .text("model", request.model)
        .part(
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

    let client = reqwest::Client::new();
    let response = client
        .post(url)
        .bearer_auth(request.api_key)
        .multipart(form)
        .send()
        .await?;

    let status = response.status();
    let body = response.text().await?;

    if !status.is_success() {
        error!(
            "Cloud transcription failed ({}): {}",
            status.as_u16(),
            body
        );
        return Err(anyhow::anyhow!(
            "Cloud transcription failed ({}): {}",
            status.as_u16(),
            body
        ));
    }

    let parsed: Value = serde_json::from_str(&body)?;
    let text = parsed
        .get("text")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    Ok(text)
}

fn build_temp_path() -> PathBuf {
    let timestamp = chrono::Utc::now().timestamp_millis();
    std::env::temp_dir().join(format!("handy-cloud-{}.wav", timestamp))
}
