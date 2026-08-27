import numpy as np

from .utils import (
    ensure_2d,
    prevent_clipping,
)


def fft_convolve(
    signal,
    impulse,
):
    output_length = (
        len(signal)
        +
        len(impulse)
        - 1
    )

    fft_size = 1 << (
        output_length - 1
    ).bit_length()

    X = np.fft.rfft(
        signal,
        n=fft_size,
    )

    H = np.fft.rfft(
        impulse,
        n=fft_size,
    )

    Y = X * H

    result = np.fft.irfft(
        Y,
        n=fft_size,
    )

    return result[
        :output_length
    ]


def create_reverb_impulse(
    sample_rate,
    duration,
    decay,
):
    length = max(
        1,
        int(
            sample_rate
            * duration
        ),
    )

    time = (
        np.arange(length)
        / sample_rate
    )

    envelope = np.exp(
        -time
        / max(
            decay,
            0.001,
        )
    )

    rng = np.random.default_rng(
        42
    )

    reflections = rng.uniform(
        -1.0,
        1.0,
        length,
    )

    impulse = (
        reflections
        * envelope
    )

    # Direct sound
    impulse[0] += 1.0

    return impulse.astype(
        np.float32
    )


def apply_reverb(
    samples,
    sample_rate,
    wet=0.35,
    decay=0.5,
    duration=1.5,
):
    samples = ensure_2d(samples)

    wet = np.clip(
        float(wet),
        0.0,
        1.0,
    )

    impulse = (
        create_reverb_impulse(
            sample_rate,
            float(duration),
            float(decay),
        )
    )

    channels = []

    for channel in range(
        samples.shape[1]
    ):
        convolved = fft_convolve(
            samples[:, channel],
            impulse,
        )

        channels.append(
            convolved
        )

    wet_signal = np.stack(
        channels,
        axis=1,
    ).astype(
        np.float32
    )

    dry_signal = np.zeros_like(
        wet_signal
    )

    dry_signal[
        :len(samples)
    ] = samples

    result = (
        (1.0 - wet)
        * dry_signal
        +
        wet
        * wet_signal
    )

    return prevent_clipping(
        result
    )