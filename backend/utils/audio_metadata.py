import soundfile as sf


def get_audio_metadata(file_path: str):
    info = sf.info(file_path)

    duration = info.frames / info.samplerate

    return {
        "duration": duration,
        "sample_rate": info.samplerate,
        "channels": info.channels,
        "format": info.format.lower(),
    }