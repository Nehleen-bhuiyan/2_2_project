import numpy as np

from .utils import (
    ensure_2d,
    smooth_frequency_mask,
)


def apply_lowpass(
    samples,
    sample_rate,
    cutoff=6000.0,
    transition=300.0,
):
    samples = ensure_2d(samples)

    n = len(samples)

    if n == 0:
        return samples.copy()

    nyquist = sample_rate / 2

    cutoff = np.clip(
        float(cutoff),
        1.0,
        nyquist - 1,
    )

    frequencies = np.fft.rfftfreq(
        n,
        d=1.0 / sample_rate,
    )

    mask = smooth_frequency_mask(
        frequencies,
        cutoff,
        transition,
        mode="lowpass",
    )

    result = np.zeros_like(
        samples,
        dtype=np.float32,
    )

    for channel in range(
        samples.shape[1]
    ):
        spectrum = np.fft.rfft(
            samples[:, channel]
        )

        filtered_spectrum = (
            spectrum * mask
        )

        reconstructed = np.fft.irfft(
            filtered_spectrum,
            n=n,
        )

        result[:, channel] = (
            reconstructed
        )

    return result.astype(
        np.float32
    )