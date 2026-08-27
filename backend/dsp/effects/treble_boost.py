import numpy as np

from .utils import (
    ensure_2d,
    prevent_clipping,
)


def apply_treble_boost(
    samples,
    sample_rate,
    amount=0.5,
    cutoff=4000.0,
):
    samples = ensure_2d(samples)

    n = len(samples)

    if n == 0:
        return samples.copy()

    frequencies = np.fft.rfftfreq(
        n,
        d=1.0 / sample_rate,
    )

    nyquist = sample_rate / 2

    amount = max(
        0.0,
        float(amount),
    )

    gain = np.ones_like(
        frequencies,
        dtype=np.float32,
    )

    high_region = (
        frequencies >= cutoff
    )

    denominator = max(
        nyquist - cutoff,
        1.0,
    )

    gain[high_region] += (
        amount
        * (
            frequencies[
                high_region
            ]
            - cutoff
        )
        / denominator
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

        spectrum *= gain

        result[:, channel] = (
            np.fft.irfft(
                spectrum,
                n=n,
            )
        )

    return prevent_clipping(
        result
    )