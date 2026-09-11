import { useRef, useState, useEffect } from "react";
import { Sparkles, Upload, Mic, Square, Loader2 } from "lucide-react";
import {
  generateDemoBuffer,
  decodeFile,
  decodeBlob,
  bufferToMonoFloat32,
  createMicRecorder,
} from "../../utils/signalLab/audioIO";

const OPTIONS = [
  { id: "demo", label: "Demo file", icon: Sparkles },
  { id: "upload", label: "Upload file", icon: Upload },
  { id: "record", label: "Record voice", icon: Mic },
];

// The three ways to get audio into an effect tab, per the visualization
// guide: a synthesized demo tone, a user-supplied file, or a live
// microphone recording.
const SourceSelector = ({ onLoad, activeSource, sourceLabel }) => {
  const fileInputRef = useRef(null);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      recorderRef.current?.cancel?.();
    };
  }, []);

  const handleDemo = () => {
    setError("");
    const { data, sampleRate } = generateDemoBuffer(4);
    onLoad(data, sampleRate, "demo", "Demo tone");
  };

  const handleUploadClick = () => {
    setError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const audioBuffer = await decodeFile(file);
      const { data, sampleRate } = bufferToMonoFloat32(audioBuffer);
      onLoad(data, sampleRate, "upload", file.name);
    } catch {
      setError("Couldn't read that audio file. Try a WAV or MP3.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const startRecording = async () => {
    setError("");
    try {
      recorderRef.current = createMicRecorder();
      await recorderRef.current.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      setError("Microphone access was denied or is unavailable.");
    }
  };

  const stopRecording = async () => {
    clearInterval(timerRef.current);
    setRecording(false);
    setLoading(true);
    try {
      const blob = await recorderRef.current.stop();
      const audioBuffer = await decodeBlob(blob);
      const { data, sampleRate } = bufferToMonoFloat32(audioBuffer);
      onLoad(data, sampleRate, "record", "Voice recording");
    } catch {
      setError("Couldn't process the recording.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        1. Choose an input signal
      </p>

      <div className="flex flex-wrap gap-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeSource === opt.id;
          if (opt.id === "record" && recording) {
            return (
              <button
                key={opt.id}
                onClick={stopRecording}
                className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
              >
                <Square size={14} fill="currentColor" /> Stop ({elapsed}s)
              </button>
            );
          }
          return (
            <button
              key={opt.id}
              onClick={
                opt.id === "demo" ? handleDemo : opt.id === "upload" ? handleUploadClick : startRecording
              }
              disabled={loading}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-white/10 bg-white/[0.03] text-white hover:border-white/20"
              }`}
            >
              {loading && isActive ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
              {opt.label}
            </button>
          );
        })}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {activeSource && sourceLabel && !recording && (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Loaded: <span className="text-white">{sourceLabel}</span>
        </p>
      )}
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default SourceSelector;
