import numpy as np

from .utils import (
    ensure_2d,
    prevent_clipping,
)


def apply_distortion(
    samples,
    amount=0.5,
    drive=4.0,
):
    """
    Soft-clipping distortion.

    amount:
        0.0 -> original signal
        1.0 -> fully distorted signal

    drive:
        controls how strongly
        the signal is pushed
        into saturation
    """

    samples = ensure_2d(
        samples
    )

    amount = np.clip(
        float(amount),
        0.0,
        1.0,
    )

    drive = max(
        0.0,
        float(drive),
    )

    if (
        len(samples) == 0
    ):
        return samples.copy()

    if (
        amount == 0.0
    ):
        return samples.copy()

    distorted = np.tanh(
        samples * drive
    )

    dry = samples

    result = (
        dry * (1.0 - amount)
        +
        distorted * amount
    )

    return prevent_clipping(
        result.astype(
            np.float32
        )
    )