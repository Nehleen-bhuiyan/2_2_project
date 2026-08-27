import numpy as np
import librosa

from .utils import ensure_2d


def time_stretch_channel(
    signal,
    rate,
):
    """
    STFT
      ↓
    phase vocoder
      ↓
    ISTFT

    rate < 1 => slower
    rate > 1 => faster
    """

    n_fft = 2048

    hop_length = (
        n_fft // 4
    )

    spectrum = librosa.stft(
        signal,
        n_fft=n_fft,
        hop_length=hop_length,
    )

    stretched_spectrum = (
        librosa.phase_vocoder(
            spectrum,
            rate=rate,
            hop_length=hop_length,
        )
    )

    expected_length = int(
        len(signal)
        / rate
    )

    result = librosa.istft(
        stretched_spectrum,
        hop_length=hop_length,
        length=expected_length,
    )

    return result.astype(
        np.float32
    )


def apply_slow(
    samples,
    rate=0.75,
):
    samples = ensure_2d(samples)

    rate = float(rate)

    if not (
        0 < rate <= 1
    ):
        raise ValueError(
            "Slow rate must be between 0 and 1."
        )

    channels = []

    for channel in range(
        samples.shape[1]
    ):
        channels.append(
            time_stretch_channel(
                samples[:, channel],
                rate,
            )
        )

    max_length = max(
        len(channel)
        for channel
        in channels
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


def apply_speed_up(
    samples,
    rate=1.25,
):
    samples = ensure_2d(samples)

    rate = float(rate)

    if rate < 1:
        raise ValueError(
            "Speed-up rate must be >= 1."
        )

    channels = []

    for channel in range(
        samples.shape[1]
    ):
        channels.append(
            time_stretch_channel(
                samples[:, channel],
                rate,
            )
        )

    max_length = max(
        len(channel)
        for channel
        in channels
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