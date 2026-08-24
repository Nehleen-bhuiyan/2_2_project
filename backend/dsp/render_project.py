import numpy as np
import soundfile as sf


def ensure_stereo(samples):
    if samples.ndim == 1:
        samples = samples[:, None]

    if samples.shape[1] == 1:
        samples = np.repeat(
            samples,
            2,
            axis=1,
        )

    return samples


def render_project(
    project_state,
    audio_records,
):
    tracks = project_state.get(
        "tracks",
        [],
    )

    if not tracks:
        raise ValueError(
            "Project has no tracks"
        )

    # ==========================================
    # FIND FIRST AUDIO TO CHOOSE SAMPLE RATE
    # ==========================================

    first_audio_id = None

    for track in tracks:
        for clip in track.get(
            "clips",
            [],
        ):
            first_audio_id = clip[
                "audioFileId"
            ]
            break

        if first_audio_id:
            break

    if not first_audio_id:
        raise ValueError(
            "Project has no clips"
        )

    target_rate = audio_records[
        first_audio_id
    ]["sample_rate"]

    # ==========================================
    # START MASTER AS EMPTY ARRAY
    # ==========================================

    master = np.zeros(
        (1, 2),
        dtype=np.float32,
    )

    # ==========================================
    # PROCESS TRACKS
    # ==========================================

    for track in tracks:

        if track.get(
            "muted",
            False,
        ):
            continue

        track_volume = track.get(
            "volume",
            1.0,
        )

        for clip in track.get(
            "clips",
            [],
        ):
            audio_id = clip[
                "audioFileId"
            ]

            record = audio_records[
                audio_id
            ]

            samples, sample_rate = sf.read(
                record["storage_key"],
                always_2d=True,
            )

            samples = samples.astype(
                np.float32
            )

            if sample_rate != target_rate:
                raise ValueError(
                    "All audio files must currently use "
                    "the same sample rate"
                )

            samples = ensure_stereo(
                samples
            )

            # ==================================
            # CUT ORIGINAL SOURCE
            # ==================================

            source_start_sample = int(
                clip["sourceStart"]
                * target_rate
            )

            source_end_sample = int(
                clip["sourceEnd"]
                * target_rate
            )

            clip_signal = samples[
                source_start_sample:
                source_end_sample
            ].copy()

            # ==================================
            # APPLY EFFECTS HERE LATER
            # ==================================

            effects = clip.get(
                "effects",
                [],
            )

            # Example later:
            #
            # clip_signal = apply_effects(
            #     clip_signal,
            #     target_rate,
            #     effects,
            # )

            # ==================================
            # VOLUME
            # ==================================

            clip_volume = clip.get(
                "volume",
                1.0,
            )

            clip_signal *= (
                clip_volume
                * track_volume
            )

            # ==================================
            # PLACE CLIP ON PROJECT TIMELINE
            # ==================================

            timeline_start_sample = int(
                clip["timelineStart"]
                * target_rate
            )

            timeline_end_sample = (
                timeline_start_sample
                + len(clip_signal)
            )

            # Expand master if needed
            if (
                timeline_end_sample
                > len(master)
            ):
                extra = (
                    timeline_end_sample
                    - len(master)
                )

                master = np.pad(
                    master,
                    (
                        (0, extra),
                        (0, 0),
                    ),
                )

            # ==================================
            # MIX
            # ==================================

            master[
                timeline_start_sample:
                timeline_end_sample
            ] += clip_signal

    # ==========================================
    # PREVENT CLIPPING
    # ==========================================

    peak = np.max(
        np.abs(master)
    )

    if peak > 1.0:
        master = (
            master / peak
        )

    return master, target_rate