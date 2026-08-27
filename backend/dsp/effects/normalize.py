import numpy as np

from .utils import ensure_float32


def apply_normalize(
    samples,
    target_peak=0.95,
):
    samples = ensure_float32(
        samples
    )

    if samples.size == 0:
        return samples

    peak = np.max(
        np.abs(samples)
    )

    if peak == 0:
        return samples.copy()

    result = (
        samples
        * (
            float(target_peak)
            / peak
        )
    )

    return result.astype(
        np.float32
    )