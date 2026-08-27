import numpy as np
import librosa

from .utils import ensure_2d


def apply_pitch_shift(
    samples,
    sample_rate,
    semitones=0.0,
):
    samples = ensure_2d(samples)

    semitones = float(
        semitones
    )

    if semitones == 0:
        return samples.copy()

    channels = []

    for channel in range(
        samples.shape[1]
    ):
        x = samples[
            :,
            channel,
        ]

        # librosa's implementation uses
        # STFT / phase-vocoder style processing
        shifted = librosa.effects.pitch_shift(
            x,
            sr=sample_rate,
            n_steps=semitones,
        )

        channels.append(
            shifted.astype(
                np.float32
            )
        )

    max_length = max(
        len(channel)
        for channel in channels
    )

    result = np.zeros(
        (
            max_length,
            len(channels),
        ),
        dtype=np.float32,
    )

    for index, channel in enumerate(
        channels
    ):
        result[
            :len(channel),
            index,
        ] = channel

    return result