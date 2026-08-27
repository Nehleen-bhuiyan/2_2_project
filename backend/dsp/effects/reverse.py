from .utils import ensure_float32


def apply_reverse(samples):
    samples = ensure_float32(
        samples
    )

    return samples[::-1].copy()