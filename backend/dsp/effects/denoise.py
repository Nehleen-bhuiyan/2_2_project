import numpy as np

from scipy.signal import (
    stft,
    istft,
)

from .utils import ensure_2d


def apply_denoise(
    samples,
    sample_rate,
    strength=0.6,
    noise_percentile=20,
    nperseg=2048,
):
    """
    Spectral-gating denoiser.

    1. STFT
    2. estimate noise spectrum
    3. attenuate weak/noisy bins
    4. inverse STFT
    """

    samples = ensure_2d(samples)

    strength = np.clip(
        float(strength),
        0.0,
        1.0,
    )

    result_channels = []

    for channel in range(
        samples.shape[1]
    ):
        x = samples[:, channel]

        frequencies, times, Zxx = stft(
            x,
            fs=sample_rate,
            nperseg=nperseg,
            noverlap=nperseg // 2,
        )

        magnitude = np.abs(
            Zxx
        )

        phase = np.angle(
            Zxx
        )

        # Estimate background noise
        # independently for each frequency.
        noise_profile = np.percentile(
            magnitude,
            noise_percentile,
            axis=1,
            keepdims=True,
        )

        threshold = (
            noise_profile
            * (
                1.0
                + 3.0 * strength
            )
        )

        # Soft mask rather than
        # hard 0/1 removal.
        mask = (
            magnitude
            /
            (
                magnitude
                + threshold
                + 1e-10
            )
        )

        # stronger strength ->
        # more aggressive attenuation
        mask = mask ** (
            1.0 + 3.0 * strength
        )

        cleaned_magnitude = (
            magnitude * mask
        )

        cleaned_spectrum = (
            cleaned_magnitude
            * np.exp(
                1j * phase
            )
        )

        _, reconstructed = istft(
            cleaned_spectrum,
            fs=sample_rate,
            nperseg=nperseg,
            noverlap=nperseg // 2,
        )

        # Restore original length
        reconstructed = reconstructed[
            :len(x)
        ]

        if (
            len(reconstructed)
            <
            len(x)
        ):
            reconstructed = np.pad(
                reconstructed,
                (
                    0,
                    len(x)
                    -
                    len(reconstructed),
                ),
            )

        result_channels.append(
            reconstructed.astype(
                np.float32
            )
        )

    result = np.stack(
        result_channels,
        axis=1,
    )

    return result