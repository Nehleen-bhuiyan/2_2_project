# import numpy as np
# import soundfile as sf
# from dsp.effects import apply_effects

# def ensure_stereo(samples):
#     if samples.ndim == 1:
#         samples = samples[:, None]

#     if samples.shape[1] == 1:
#         samples = np.repeat(
#             samples,
#             2,
#             axis=1,
#         )

#     return samples


# def render_project(
#     project_state,
#     audio_records,
# ):
#     tracks = project_state.get(
#         "tracks",
#         [],
#     )

#     if not tracks:
#         raise ValueError(
#             "Project has no tracks"
#         )

#     # ==========================================
#     # FIND FIRST AUDIO TO CHOOSE SAMPLE RATE
#     # ==========================================

#     first_audio_id = None

#     for track in tracks:
#         for clip in track.get(
#             "clips",
#             [],
#         ):
#             first_audio_id = clip[
#                 "audioFileId"
#             ]
#             break

#         if first_audio_id:
#             break

#     if not first_audio_id:
#         raise ValueError(
#             "Project has no clips"
#         )

#     target_rate = audio_records[
#         first_audio_id
#     ]["sample_rate"]

#     # ==========================================
#     # START MASTER AS EMPTY ARRAY
#     # ==========================================

#     master = np.zeros(
#         (1, 2),
#         dtype=np.float32,
#     )

#     # ==========================================
#     # PROCESS TRACKS
#     # ==========================================

#     for track in tracks:

#         if track.get(
#             "muted",
#             False,
#         ):
#             continue

#         track_volume = track.get(
#             "volume",
#             1.0,
#         )

#         for clip in track.get(
#             "clips",
#             [],
#         ):
#             audio_id = clip[
#                 "audioFileId"
#             ]

#             record = audio_records[
#                 audio_id
#             ]

#             samples, sample_rate = sf.read(
#                 record["storage_key"],
#                 always_2d=True,
#             )

#             samples = samples.astype(
#                 np.float32
#             )

#             if sample_rate != target_rate:
#                 raise ValueError(
#                     "All audio files must currently use "
#                     "the same sample rate"
#                 )

#             samples = ensure_stereo(
#                 samples
#             )

#             # ==================================
#             # CUT ORIGINAL SOURCE
#             # ==================================

#             source_start_sample = int(
#                 clip["sourceStart"]
#                 * target_rate
#             )

#             source_end_sample = int(
#                 clip["sourceEnd"]
#                 * target_rate
#             )

#             clip_signal = samples[
#                 source_start_sample:
#                 source_end_sample
#             ].copy()

#             # ==================================
#             # APPLY EFFECTS HERE LATER
#             # ==================================

#             effects = clip.get(
#                 "effects",
#                 [],
#             )

#             # Example later:
#             #
#             # clip_signal = apply_effects(
#             #     clip_signal,
#             #     target_rate,
#             #     effects,
#             # )

#             # ==================================
#             # VOLUME
#             # ==================================

#             clip_volume = clip.get(
#                 "volume",
#                 1.0,
#             )

#             clip_signal *= (
#                 clip_volume
#                 * track_volume
#             )

#             # ==================================
#             # PLACE CLIP ON PROJECT TIMELINE
#             # ==================================

#             timeline_start_sample = int(
#                 clip["timelineStart"]
#                 * target_rate
#             )

#             timeline_end_sample = (
#                 timeline_start_sample
#                 + len(clip_signal)
#             )

#             # Expand master if needed
#             if (
#                 timeline_end_sample
#                 > len(master)
#             ):
#                 extra = (
#                     timeline_end_sample
#                     - len(master)
#                 )

#                 master = np.pad(
#                     master,
#                     (
#                         (0, extra),
#                         (0, 0),
#                     ),
#                 )

#             # ==================================
#             # MIX
#             # ==================================

#             master[
#                 timeline_start_sample:
#                 timeline_end_sample
#             ] += clip_signal

#     # ==========================================
#     # PREVENT CLIPPING
#     # ==========================================

#     peak = np.max(
#         np.abs(master)
#     )

#     if peak > 1.0:
#         master = (
#             master / peak
#         )

#     return master, target_rate
import numpy as np
import soundfile as sf

from dsp.effects import apply_effects


def ensure_stereo(samples):
    """
    Ensure audio has shape:

        (samples, 2)

    Mono:
        (N, 1) -> duplicated to stereo

    Stereo:
        stays unchanged
    """

    if samples.ndim == 1:
        samples = samples[:, None]

    if samples.shape[1] == 1:
        samples = np.repeat(
            samples,
            2,
            axis=1,
        )

    return samples.astype(
        np.float32
    )


def render_project(
    project_state,
    audio_records,
):
    """
    Reconstruct the complete project.

    Workflow:

    source file
        ↓
    sourceStart/sourceEnd
        ↓
    clip effects
        ↓
    clip volume
        ↓
    track volume
        ↓
    timelineStart
        ↓
    mix into master
    """

    tracks = project_state.get(
        "tracks",
        [],
    )

    if not tracks:
        raise ValueError(
            "Project has no tracks"
        )


    # ==========================================
    # FIND FIRST VALID CLIP
    # ==========================================

    first_audio_id = None

    for track in tracks:
        for clip in track.get(
            "clips",
            [],
        ):
            audio_id = clip.get(
                "audioFileId"
            )

            if audio_id:
                first_audio_id = (
                    audio_id
                )

                break

        if first_audio_id:
            break


    if not first_audio_id:
        raise ValueError(
            "Project has no clips"
        )


    # ==========================================
    # DETERMINE TARGET SAMPLE RATE
    # ==========================================

    if (
        first_audio_id
        not in audio_records
    ):
        raise ValueError(
            f"Audio record not found: "
            f"{first_audio_id}"
        )


    target_rate = int(
        audio_records[
            first_audio_id
        ]["sample_rate"]
    )


    # ==========================================
    # EMPTY MASTER SIGNAL
    # ==========================================

    # /*
    # Conceptually this is:

    # project timeline
    # 0s ---------------------------->

    # [ silence ]

    # Clips are later inserted into this array.
    # */

    master = np.zeros(
        (1, 2),
        dtype=np.float32,
    )


    # ==========================================
    # PROCESS TRACKS
    # ==========================================

    for track in tracks:

        # --------------------------------------
        # MUTED TRACK
        # --------------------------------------

        if track.get(
            "muted",
            False,
        ):
            continue


        track_volume = float(
            track.get(
                "volume",
                1.0,
            )
        )


        # ======================================
        # PROCESS CLIPS
        # ======================================

        for clip in track.get(
            "clips",
            [],
        ):

            audio_id = clip.get(
                "audioFileId"
            )


            if not audio_id:
                continue


            if (
                audio_id
                not in audio_records
            ):
                raise ValueError(
                    f"Audio record not found: "
                    f"{audio_id}"
                )


            record = audio_records[
                audio_id
            ]


            # ==================================
            # LOAD ORIGINAL AUDIO FILE
            # ==================================

            samples, sample_rate = (
                sf.read(
                    record[
                        "storage_key"
                    ],
                    always_2d=True,
                    dtype="float32",
                )
            )


            if (
                sample_rate
                != target_rate
            ):
                raise ValueError(
                    "All audio files must "
                    "currently use the same "
                    "sample rate."
                )


            samples = ensure_stereo(
                samples
            )


            # ==================================
            # FIND SOURCE RANGE
            # ==================================

            source_start = float(
                clip.get(
                    "sourceStart",
                    0.0,
                )
            )


            source_end = float(
                clip.get(
                    "sourceEnd",
                    len(samples)
                    / target_rate,
                )
            )


            source_start_sample = int(
                source_start
                * target_rate
            )


            source_end_sample = int(
                source_end
                * target_rate
            )


            # Protect against invalid metadata

            source_start_sample = max(
                0,
                source_start_sample,
            )

            source_end_sample = min(
                len(samples),
                source_end_sample,
            )


            if (
                source_end_sample
                <= source_start_sample
            ):
                continue


            # ==================================
            # CUT SOURCE CLIP
            # ==================================

            clip_signal = samples[
                source_start_sample:
                source_end_sample
            ].copy()


            # ==================================
            # APPLY CLIP EFFECTS
            # ==================================

            effects = clip.get(
                "effects",
                [],
            )


            clip_signal = apply_effects(
                clip_signal,
                target_rate,
                effects,
            )


            # Ensure effect output still has
            # correct stereo structure.

            clip_signal = ensure_stereo(
                clip_signal
            )


            # ==================================
            # APPLY VOLUME
            # ==================================

            clip_volume = float(
                clip.get(
                    "volume",
                    1.0,
                )
            )


            clip_signal *= (
                clip_volume
                * track_volume
            )


            # ==================================
            # TIMELINE POSITION
            # ==================================

            timeline_start = float(
                clip.get(
                    "timelineStart",
                    0.0,
                )
            )


            timeline_start_sample = int(
                timeline_start
                * target_rate
            )


            timeline_start_sample = max(
                0,
                timeline_start_sample,
            )


            # /*
            # IMPORTANT:

            # Use the PROCESSED clip length.

            # Slow, reverb and echo may make
            # clip_signal longer than the
            # original source clip.
            # */

            timeline_end_sample = (
                timeline_start_sample
                + len(clip_signal)
            )


            # ==================================
            # EXPAND MASTER IF NECESSARY
            # ==================================

            if (
                timeline_end_sample
                > len(master)
            ):
                extra_samples = (
                    timeline_end_sample
                    - len(master)
                )


                master = np.pad(
                    master,
                    (
                        (
                            0,
                            extra_samples,
                        ),
                        (
                            0,
                            0,
                        ),
                    ),
                    mode="constant",
                )


            # ==================================
            # MIX CLIP INTO MASTER
            # ==================================

            master[
                timeline_start_sample:
                timeline_end_sample
            ] += clip_signal


    # ==========================================
    # FINAL PEAK PROTECTION
    # ==========================================

    if master.size == 0:
        raise ValueError(
            "Project produced no audio"
        )


    peak = np.max(
        np.abs(master)
    )


    if peak > 1.0:
        master = (
            master / peak
        )


    return (
        master.astype(
            np.float32
        ),
        target_rate,
    )