<div align="center">

# 🎧 AudiVerse

### ✨ Audio Editing & Signal Processing Platform

A full-stack audio editor that combines **multi-track editing**, **digital signal processing**, and **interactive audio experimentation**.

<br>

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/DSP-Python-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![NumPy](https://img.shields.io/badge/Signal%20Processing-NumPy-013243?logo=numpy&logoColor=white)

</div>

---

## 🌌 About AudiVerse

**AudiVerse** is a full-stack **audio editing and digital signal processing platform** designed to combine practical audio editing with core concepts from **Signals and Linear Systems** and **Digital Signal Processing**.

With AudiVerse, users can:

- 🎵 Upload and organize audio
- 🎚️ Apply signal-processing effects
- 🎛️ Edit audio clips on a timeline
- 🌊 Visualize and manipulate frequency content
- 🔊 Preview processed audio
- 💾 Save project state
- 📥 Export the final result

AudiVerse is designed both as an:

> 🎧 **Audio Editing Tool**  
> and  
> 📡 **Interactive DSP Laboratory**

---

# 🚀 Main Features

## 🎼 Project-Based Audio Editing

AudiVerse provides a project-based workflow similar to a lightweight digital audio workstation.

### Features

- 📁 Create and manage projects
- 🎵 Upload audio files
- 🧩 Add audio clips to tracks
- 🕒 Arrange clips on a timeline
- 🎯 Select individual clips
- ▶️ Control playback with a playhead
- 💾 Save project state
- ↩️ Undo and redo operations
- 🔊 Generate project previews
- 📥 Download processed audio

---

# 🎛️ Audio Effects

AudiVerse includes multiple configurable DSP effects.

---

## 🐢 Slow Down

Slows the selected audio by increasing its duration.

```text
Original Audio
      ↓
Time Scaling
      ↓
Longer Audio
```

This demonstrates **time-scale modification**.

---

## ⚡ Speed Up

Reduces the duration of the selected audio.

Useful for demonstrating how discrete signals can be resampled or time-scaled.

---

## ⏱️ Time Stretch

Changes the duration of audio while supporting DSP-based time-scale processing.

This is useful when duration needs to change while preserving other important signal characteristics.

---

## 🌊 Reverb

Adds artificial reverberation using **convolution**.

```text
Input Signal
     ↓
Impulse Response
     ↓
Convolution
     ↓
Reverberated Signal
```

Typical parameters:

- Reverb amount
- Decay
- Duration

Mathematically:

```text
y[n] = x[n] * h[n]
```

where:

```text
x[n] = input audio
h[n] = impulse response
```

---

## 📻 Echo

Creates delayed repetitions of the input audio.

```text
y[n] = x[n]
     + αx[n-D]
     + α²x[n-2D]
     + ...
```

Typical controls include:

- Delay
- Feedback
- Number of repeats
- Effect amount

---

## ✨ Denoise

Reduces unwanted background noise using frequency-domain processing.

The system performs short-time spectral analysis and suppresses unwanted frequency components.

The feature can analyze:

- 📈 Original spectrum
- 🚫 Removed spectrum
- ✅ Processed spectrum

This demonstrates practical use of:

- STFT
- Spectral magnitude analysis
- Noise estimation
- Frequency-domain attenuation

---

## 🔽 Low-Pass Filter

Allows low-frequency components to pass while suppressing higher frequencies.

Useful for:

- Removing high-frequency noise
- Softening harsh audio
- Smoothing signals

```text
Low Frequencies ✅
High Frequencies ❌
```

---

## 🔼 High-Pass Filter

Allows high-frequency components to pass while suppressing lower frequencies.

Useful for:

- Removing low-frequency rumble
- Reducing very low-frequency interference
- Removing DC-like components

```text
Low Frequencies ❌
High Frequencies ✅
```

---

## 🔊 Bass Boost

Amplifies low-frequency components.

Useful for emphasizing:

- Bass instruments
- Low-frequency beats
- Deeper tonal content

---

## ✨ Treble Boost

Amplifies higher-frequency components.

Useful for increasing:

- Brightness
- Clarity
- High-frequency detail

---

## 🎚️ Equalizer

Provides independent control over different frequency regions.

| Band | Purpose |
|---|---|
| 🔊 Bass | Low frequencies |
| 🎵 Mid | Mid-range frequencies |
| ✨ Treble | High frequencies |

Each band can be independently amplified or attenuated.

---

## 🎤 Pitch Shift

Changes the perceived pitch of audio.

Pitch shift is controlled using musical semitones.

```text
+12 semitones → 1 octave higher
-12 semitones → 1 octave lower
+7 semitones  → perfect fifth higher
```

---

## 🔄 Reverse

Reverses the order of audio samples.

```text
Original:
[x0, x1, x2, x3]

Reversed:
[x3, x2, x1, x0]
```

---

## 📊 Normalize

Scales the waveform so its peak reaches a target amplitude.

```text
peak = max(|x[n]|)

y[n] = x[n] × target_peak / peak
```

Normalization improves signal level while avoiding clipping.

---

## 📈 Fade In

Gradually increases amplitude from silence to the original signal level.

```text
0% ────────► 100%
```

---

## 📉 Fade Out

Gradually decreases amplitude toward silence.

```text
100% ────────► 0%
```

---

## 🔉 Gain

Changes signal amplitude.

```text
y[n] = G × x[n]
```

where:

```text
G = gain factor
```

AudiVerse also applies clipping protection when required.

---

## ⚡ Distortion

Applies nonlinear amplitude transformation.

This introduces new harmonic components into the signal and creates a stronger, more aggressive sound.

Typical parameters:

- Amount
- Drive

---

# 📡 DSP Concepts Demonstrated

AudiVerse connects theoretical signal-processing concepts with practical audio effects.

| DSP Concept | AudiVerse Application |
|---|---|
| Sampling | Digital audio representation |
| FFT | Frequency analysis |
| IFFT | Signal reconstruction |
| Convolution | Reverb |
| Delay | Echo |
| STFT | Denoising |
| Filtering | Low-pass / High-pass |
| Frequency bands | Equalizer |
| Time scaling | Slow / Speed Up |
| Pitch processing | Pitch Shift |
| Amplitude scaling | Gain |
| Envelope shaping | Fade In / Fade Out |
| Nonlinear systems | Distortion |

---

# 🧠 Signal Processing Pipeline

```text
Audio Input
    ↓
Discrete Samples
    ↓
DSP Operation
    ↓
Processed Samples
    ↓
Project Renderer
    ↓
Audio Preview
    ↓
Final Output
```

---

# 🏗️ System Architecture

AudiVerse uses a full-stack architecture.

```text
┌────────────────────────┐
│    React Frontend      │
│                       │
│ Timeline / Editor UI   │
└───────────┬────────────┘
            │
            │ REST API
            ▼
┌────────────────────────┐
│    FastAPI Backend     │
│                       │
│ Authentication         │
│ Project Management     │
│ Audio Rendering        │
│ DSP Processing         │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ PostgreSQL / Neon DB   │
│                       │
│ Users                  │
│ Projects               │
│ Tracks                 │
│ Clips                  │
│ Project State          │
└────────────────────────┘
```

---

# 🧩 Project Data Structure

AudiVerse organizes editor data using:

```text
Project
│
├── Track 1
│   ├── Clip 1
│   │   ├── Source Audio
│   │   ├── Timeline Start
│   │   └── Effects
│   │
│   └── Clip 2
│
└── Track 2
    └── Clip 3
```

Each clip can contain:

- Source start
- Source end
- Timeline position
- Applied effects
- Effect parameters

---

# 🛠️ Technology Stack

## 💻 Frontend

- ⚛️ React
- 🧭 React Router
- 🌐 Axios
- 🎨 Tailwind CSS
- ✨ Lucide React
- 🔊 Web Audio API
- 🟨 JavaScript

## 🐍 Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Neon PostgreSQL

## 📊 Signal Processing

- NumPy
- SciPy
- FFT / IFFT
- STFT
- Convolution
- Frequency-domain filtering
- Time scaling
- Pitch processing
- Spectral denoising

---

# 📂 Project Structure

```text
AudiVerse/
│
├── frontend/
│   │
│   ├── src/
│   │   │
│   │   ├── components/
│   │   │   └── editor/
│   │   │       ├── Timeline.jsx
│   │   │       ├── EditorControls.jsx
│   │   │       └── EditingRibbon.jsx
│   │   │
│   │   ├── pages/
│   │   │   └── ProjectEditor.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── context/
│   │   └── assets/
│   │
│   ├── package.json
│   └── ...
│
├── backend/
│   │
│   ├── main.py
│   ├── routes/
│   ├── controllers/
│   ├── schemas/
│   ├── middleware/
│   ├── dsp/
│   │   └── effects/
│   ├── storage/
│   └── ...
│
└── README.md
```

---

# ⚙️ Local Setup

## ✅ Prerequisites

Install:

- Python 3.x
- Node.js
- npm
- Git
- PostgreSQL or Neon PostgreSQL access

Recommended:

```text
Python 3.11+
Node.js 18+
```

---

# 📥 1. Clone the Repository

```bash
git clone <your-repository-url>
cd AudiVerse
```

---

# 🐍 Backend Setup

## 2. Open the Backend

```bash
cd backend
```

## 3. Create a Virtual Environment

### Windows PowerShell

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### Windows CMD

```cmd
python -m venv .venv
.venv\Scripts\activate.bat
```

### Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 4. Install Backend Dependencies

If `requirements.txt` exists:

```bash
pip install -r requirements.txt
```

Otherwise:

```bash
pip install fastapi uvicorn numpy scipy sqlalchemy psycopg2-binary python-multipart
```

---

# 🗄️ Database Configuration

Create a `.env` file inside the backend directory.

Example:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST/DATABASE?sslmode=require
```

For Neon PostgreSQL, copy your connection string from the Neon dashboard.

> ⚠️ Never commit database passwords or secret keys to GitHub.

---

# ▶️ Start the Backend

Run:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# ⚛️ Frontend Setup

Open a second terminal.

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will usually run at:

```text
http://localhost:5173
```

---

# 🚀 Run the Full Application

Two terminals are required.

### Terminal 1

```bash
cd backend
.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### Terminal 2

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 🎧 Basic Workflow

```text
🆕 Create Project
       ↓
🎵 Upload Audio
       ↓
🧩 Add Clip to Timeline
       ↓
🎯 Select Clip
       ↓
🎛️ Choose Effect
       ↓
⚙️ Adjust Parameters
       ↓
💾 Save Project
       ↓
🔊 Generate Preview
       ↓
🎧 Listen
       ↓
📥 Download Result
```

---

# 🔬 DSP Processing Workflow

```text
Selected Audio Clip
        ↓
Effect ID + Parameters
        ↓
DSP Dispatcher
        ↓
Signal Processing Function
        ↓
Processed Samples
        ↓
Project Renderer
        ↓
Preview Audio
```

---

# 🎛️ Available Effects

| Effect | Category |
|---|---|
| 🐢 Slow | Time |
| ⚡ Speed Up | Time |
| ⏱️ Time Stretch | Time |
| 🌊 Reverb | Convolution |
| 📻 Echo | Delay |
| ✨ Denoise | Spectral |
| 🔽 Low-pass | Filtering |
| 🔼 High-pass | Filtering |
| 🔊 Bass Boost | Equalization |
| ✨ Treble Boost | Equalization |
| 🎚️ Equalizer | Frequency Control |
| 🎤 Pitch Shift | Pitch |
| 🔄 Reverse | Time Domain |
| 📊 Normalize | Amplitude |
| 📈 Fade In | Amplitude |
| 📉 Fade Out | Amplitude |
| 🔉 Gain | Amplitude |
| ⚡ Distortion | Nonlinear DSP |

---

# 🗃️ Audio Storage

During development, uploaded and rendered audio can be served through backend storage routes such as:

```text
http://127.0.0.1:8000/storage/...
```

The backend generates project previews that contain:

- Clip positions
- Timeline offsets
- Effect processing
- Audio duration
- Final rendered output

---

# 🛠️ Troubleshooting

## ❌ Backend Does Not Start

Check:

```bash
python --version
pip list
```

Then reinstall dependencies:

```bash
pip install -r requirements.txt
```

## ❌ ModuleNotFoundError

Make sure:

- The virtual environment is activated
- Dependencies are installed
- You are inside the backend directory

## ❌ Database Connection Error

Possible errors:

```text
psycopg2.OperationalError
```

or:

```text
sqlalchemy.exc.OperationalError
```

Check:

- Internet connection
- Database URL
- Username
- Password
- Hostname
- Neon project status
- SSL configuration

## ❌ Frontend Cannot Reach Backend

Make sure the backend is running at:

```text
http://127.0.0.1:8000
```

Also check:

```text
frontend/src/services/api.js
```

## ❌ CORS Error

Make sure the frontend URL is included in the FastAPI CORS configuration.

Example:

```text
http://localhost:5173
```

---

# 🎓 Educational Purpose

AudiVerse was developed to connect theoretical DSP concepts with real-world audio applications.

```text
Convolution
     ↓
Reverb
```

```text
Delay
     ↓
Echo
```

```text
FFT
     ↓
Frequency Filtering
```

```text
STFT
     ↓
Denoising
```

```text
Amplitude Envelope
     ↓
Fade In / Fade Out
```

```text
Nonlinear Processing
     ↓
Distortion
```

AudiVerse therefore acts as both:

> 🎧 **A practical audio editor**

and

> 📡 **A digital signal processing laboratory**

---




## 🎓 Course Project

### Signals and Linear Systems / Signal Processing

# 🎧 AudiVerse

### Audio Editing & Signal Processing Platform

Made using **React, FastAPI, Python and DSP**


