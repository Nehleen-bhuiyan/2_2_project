import numpy as np

from .utils import ensure_2d


def apply_fade_in(
    samples,
    sample_rate,
    duration=1.0,
):
    samples = ensure_2d(
        samples
    )

    fade_samples = int(
        float(duration)
        * sample_rate
    )

    fade_samples = min(
        fade_samples,
        len(samples),
    )

    if fade_samples <= 0:
        return samples.copy()

    fade = np.linspace(
        0.0,
        1.0,
        fade_samples,
        dtype=np.float32,
    )[:, None]

    result = samples.copy()

    result[:fade_samples] *= fade

    return result


def apply_fade_out(
    samples,
    sample_rate,
    duration=1.0,
):
    samples = ensure_2d(
        samples
    )

    fade_samples = int(
        float(duration)
        * sample_rate
    )

    fade_samples = min(
        fade_samples,
        len(samples),
    )

    if fade_samples <= 0:
        return samples.copy()

    fade = np.linspace(
        1.0,
        0.0,
        fade_samples,
        dtype=np.float32,
    )[:, None]

    result = samples.copy()

    result[-fade_samples:] *= fade

    return result