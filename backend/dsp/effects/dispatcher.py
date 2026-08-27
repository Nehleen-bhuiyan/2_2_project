from .gain import apply_gain
from .normalize import apply_normalize
from .reverse import apply_reverse

from .fade import (
    apply_fade_in,
    apply_fade_out,
)

from .lowpass import apply_lowpass
from .highpass import apply_highpass

from .reverb import apply_reverb
from .echo import apply_echo

from .slow import (
    apply_slow,
    apply_speed_up,
)

from .pitch import apply_pitch_shift
from .denoise import apply_denoise

from .bass_boost import apply_bass_boost
from .treble_boost import apply_treble_boost

from .equalizer import apply_equalizer


# ============================================================
# APPLY ONE EFFECT
# ============================================================

def apply_effect(
    samples,
    sample_rate,
    effect,
):
    """
    Apply one effect object.

    Expected structure:

    {
        "id": "...",
        "type": "reverb",
        "enabled": True,
        "parameters": {
            "value": 0.4
        }
    }
    """

    # --------------------------------------------------------
    # DISABLED EFFECT
    # --------------------------------------------------------

    if not effect.get(
        "enabled",
        True,
    ):
        return samples


    effect_type = effect.get(
        "type"
    )

    params = effect.get(
        "parameters",
        {},
    )

    # Most simple effects currently
    # use one slider value.
    value = params.get(
        "value"
    )


    # ========================================================
    # GAIN
    # ========================================================

    if effect_type == "gain":
        return apply_gain(
            samples,
            gain=(
                value
                if value is not None
                else 1.0
            ),
        )


    # ========================================================
    # NORMALIZE
    # ========================================================

    if effect_type == "normalize":
        return apply_normalize(
            samples
        )


    # ========================================================
    # REVERSE
    # ========================================================

    if effect_type == "reverse":
        return apply_reverse(
            samples
        )


    # ========================================================
    # FADE IN
    # ========================================================

    if effect_type == "fadeIn":
        return apply_fade_in(
            samples,
            sample_rate,
            duration=(
                value
                if value is not None
                else 1.0
            ),
        )


    # ========================================================
    # FADE OUT
    # ========================================================

    if effect_type == "fadeOut":
        return apply_fade_out(
            samples,
            sample_rate,
            duration=(
                value
                if value is not None
                else 1.0
            ),
        )


    # ========================================================
    # LOW PASS
    # ========================================================

    if effect_type == "lowpass":
        return apply_lowpass(
            samples,
            sample_rate,
            cutoff=(
                value
                if value is not None
                else 6000.0
            ),
        )


    # ========================================================
    # HIGH PASS
    # ========================================================

    if effect_type == "highpass":
        return apply_highpass(
            samples,
            sample_rate,
            cutoff=(
                value
                if value is not None
                else 120.0
            ),
        )


    # ========================================================
    # REVERB
    # ========================================================

    if effect_type == "reverb":
        return apply_reverb(
            samples,
            sample_rate,
            wet=(
                value
                if value is not None
                else 0.35
            ),

            decay=params.get(
                "decay",
                0.5,
            ),

            duration=params.get(
                "duration",
                1.5,
            ),
        )


    # ========================================================
    # ECHO
    # ========================================================

    if effect_type == "echo":
        return apply_echo(
            samples,
            sample_rate,

            delay=params.get(
                "delay",
                0.35,
            ),

            feedback=params.get(
                "feedback",
                0.4,
            ),

            repeats=params.get(
                "repeats",
                3,
            ),

            wet=(
                value
                if value is not None
                else params.get(
                    "wet",
                    0.4,
                )
            ),
        )


    # ========================================================
    # SLOW
    # ========================================================

    if effect_type == "slow":
        return apply_slow(
            samples,

            rate=(
                value
                if value is not None
                else 0.75
            ),
        )


    # ========================================================
    # SPEED UP
    # ========================================================

    if effect_type == "speedUp":
        return apply_speed_up(
            samples,

            rate=(
                value
                if value is not None
                else 1.25
            ),
        )


    # ========================================================
    # PITCH SHIFT
    # ========================================================

    if effect_type == "pitch":
        return apply_pitch_shift(
            samples,
            sample_rate,

            semitones=(
                value
                if value is not None
                else 0.0
            ),
        )


    # ========================================================
    # DENOISE
    # ========================================================

    if effect_type == "denoise":
        return apply_denoise(
            samples,
            sample_rate,

            strength=(
                value
                if value is not None
                else 0.6
            ),

            noise_percentile=params.get(
                "noise_percentile",
                20,
            ),

            nperseg=params.get(
                "nperseg",
                2048,
            ),
        )


    # ========================================================
    # BASS BOOST
    # ========================================================

    if effect_type == "bassBoost":
        return apply_bass_boost(
            samples,
            sample_rate,

            amount=(
                value
                if value is not None
                else 0.5
            ),

            cutoff=params.get(
                "cutoff",
                250.0,
            ),
        )


    # ========================================================
    # TREBLE BOOST
    # ========================================================

    if effect_type == "trebleBoost":
        return apply_treble_boost(
            samples,
            sample_rate,

            amount=(
                value
                if value is not None
                else 0.5
            ),

            cutoff=params.get(
                "cutoff",
                4000.0,
            ),
        )


    # ========================================================
    # EQUALIZER
    # ========================================================

    if effect_type == "equalizer":
        return apply_equalizer(
            samples,
            sample_rate,

            bass_db=params.get(
                "bass",
                0.0,
            ),

            mid_db=params.get(
                "mid",
                0.0,
            ),

            treble_db=params.get(
                "treble",
                0.0,
            ),
        )


    # ========================================================
    # UNKNOWN EFFECT
    # ========================================================

    print(
        f"Unknown effect type: {effect_type}"
    )

    return samples


# ============================================================
# APPLY ALL EFFECTS IN ORDER
# ============================================================

def apply_effects(
    samples,
    sample_rate,
    effects,
):
    """
    Applies effects sequentially.

    Effect order matters.

    Example:

    [
        denoise,
        pitch,
        reverb
    ]

    becomes:

    original
       ↓
    denoise
       ↓
    pitch
       ↓
    reverb
    """

    result = samples.copy()

    for effect in effects:
        result = apply_effect(
            result,
            sample_rate,
            effect,
        )

    return result