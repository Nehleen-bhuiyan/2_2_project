import numpy as np

from .utils import (
    ensure_2d,
    prevent_clipping,
)


def apply_echo(
    samples,
    sample_rate,
    delay=0.35,
    feedback=0.4,
    repeats=3,
    wet=0.4,
):
    samples = ensure_2d(
        samples
    )

    wet = np.clip(
        float(wet),
        0.0,
        1.0,
    )

    feedback = np.clip(
        float(feedback),
        0.0,
        0.95,
    )

    delay_samples = max(
        1,
        int(
            float(delay)
            * sample_rate
        ),
    )

    output_length = (
        len(samples)
        +
        delay_samples
        * int(repeats)
    )

    echo_signal = np.zeros(
        (
            output_length,
            samples.shape[1],
        ),
        dtype=np.float32,
    )

    echo_signal[
        :len(samples)
    ] += samples

    for repeat in range(
        1,
        int(repeats) + 1
    ):
        start = (
            delay_samples
            * repeat
        )

        end = (
            start
            + len(samples)
        )

        echo_signal[
            start:end
        ] += (
            samples
            * (
                feedback ** repeat
            )
        )

    dry = np.zeros_like(
        echo_signal
    )

    dry[
        :len(samples)
    ] = samples

    result = (
        dry * (1.0 - wet)
        +
        echo_signal * wet
    )

    return prevent_clipping(
        result
    )