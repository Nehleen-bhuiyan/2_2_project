import numpy as np


def ensure_float32(samples):
    return np.asarray(
        samples,
        dtype=np.float32,
    )


def ensure_2d(samples):
    samples = ensure_float32(samples)

    if samples.ndim == 1:
        samples = samples[:, None]

    return samples


def prevent_clipping(samples):
    samples = ensure_float32(samples)

    if samples.size == 0:
        return samples

    peak = np.max(
        np.abs(samples)
    )

    if peak > 1.0:
        samples = samples / peak

    return samples.astype(
        np.float32
    )


def smooth_frequency_mask(
    frequencies,
    cutoff,
    transition,
    mode,
):
    """
    Creates a smooth FFT-domain filter.

    This is better than suddenly setting
    frequency bins to zero because a hard
    cutoff can produce ringing.
    """

    frequencies = np.asarray(
        frequencies
    )

    mask = np.zeros_like(
        frequencies,
        dtype=np.float32,
    )

    transition = max(
        float(transition),
        1.0,
    )

    if mode == "lowpass":
        pass_end = max(
            0,
            cutoff - transition,
        )

        stop_start = (
            cutoff + transition
        )

        mask[
            frequencies <= pass_end
        ] = 1.0

        transition_region = (
            (frequencies > pass_end)
            &
            (frequencies < stop_start)
        )

        x = (
            frequencies[
                transition_region
            ]
            - pass_end
        ) / (
            stop_start
            - pass_end
        )

        mask[
            transition_region
        ] = (
            0.5
            * (
                1
                + np.cos(
                    np.pi * x
                )
            )
        )

    elif mode == "highpass":
        stop_end = max(
            0,
            cutoff - transition,
        )

        pass_start = (
            cutoff + transition
        )

        mask[
            frequencies >= pass_start
        ] = 1.0

        transition_region = (
            (frequencies > stop_end)
            &
            (frequencies < pass_start)
        )

        x = (
            frequencies[
                transition_region
            ]
            - stop_end
        ) / (
            pass_start
            - stop_end
        )

        mask[
            transition_region
        ] = (
            0.5
            * (
                1
                - np.cos(
                    np.pi * x
                )
            )
        )

    else:
        raise ValueError(
            f"Unknown filter mode: {mode}"
        )

    return mask