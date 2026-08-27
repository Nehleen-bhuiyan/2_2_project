from .utils import (
    ensure_float32,
    prevent_clipping,
)


def apply_gain(
    samples,
    gain=1.0,
):
    samples = ensure_float32(
        samples
    )

    result = (
        samples * float(gain)
    )

    return prevent_clipping(
        result
    )