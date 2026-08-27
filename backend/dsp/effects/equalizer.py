import numpy as np

from .utils import (
    ensure_2d,
    prevent_clipping,
)


def db_to_gain(db):
    return 10 ** (
        float(db) / 20.0
    )


def apply_equalizer(
    samples,
    sample_rate,
    bass_db=0.0,
    mid_db=0.0,
    treble_db=0.0,
):
    """
    Simple 3-band FFT equalizer.

    bass:
        20 - 250 Hz

    mid:
        250 - 4000 Hz

    treble:
        4000 Hz - Nyquist
    """

    samples = ensure_2d(samples)

    n = len(samples)

    if n == 0:
        return samples.copy()

    frequencies = np.fft.rfftfreq(
        n,
        d=1.0 / sample_rate,
    )

    gain = np.ones_like(
        frequencies,
        dtype=np.float32,
    )

    bass_gain = db_to_gain(
        bass_db
    )

    mid_gain = db_to_gain(
        mid_db
    )

    treble_gain = db_to_gain(
        treble_db
    )

    bass_region = (
        frequencies < 250
    )

    mid_region = (
        (frequencies >= 250)
        &
        (frequencies < 4000)
    )

    treble_region = (
        frequencies >= 4000
    )

    gain[
        bass_region
    ] = bass_gain

    gain[
        mid_region
    ] = mid_gain

    gain[
        treble_region
    ] = treble_gain

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

        modified = (
            spectrum * gain
        )

        result[:, channel] = (
            np.fft.irfft(
                modified,
                n=n,
            )
        )

    return prevent_clipping(
        result
    )