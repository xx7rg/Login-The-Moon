"use client";

import {
  FormEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type LoginState = "idle" | "loading" | "success";

const stars = [
  [7, 14, 1.4, 0.2],
  [15, 72, 1, 1.7],
  [23, 34, 1.8, 0.8],
  [30, 83, 1.2, 2.4],
  [38, 18, 1, 1.1],
  [44, 67, 1.6, 2.9],
  [51, 8, 1.2, 0.5],
  [57, 49, 1, 2.1],
  [63, 76, 1.5, 1.4],
  [70, 27, 1.1, 3.2],
  [76, 60, 1.8, 0.7],
  [82, 12, 1.1, 2.6],
  [87, 43, 1.4, 1.8],
  [92, 79, 1, 3.5],
  [96, 22, 1.7, 1.3],
] as const;

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sceneActivated, setSceneActivated] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [helperMessage, setHelperMessage] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const aircraftSoundPlayed = useRef(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isExpoWebView =
      new URLSearchParams(window.location.search).get("expo") === "1";
    if (isExpoWebView || /\bwv\b|ReactNativeWebView|x7rg-native-webview/i.test(userAgent)) {
      document.documentElement.classList.add("x7rg-native-webview");
    }

    return () => {
      timers.current.forEach(clearTimeout);
      void audioContext.current?.close();
    };
  }, []);

  function handleCardMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    event.currentTarget.style.setProperty(
      "--shine-x",
      `${Math.round((x + 0.5) * 100)}%`,
    );
    event.currentTarget.style.setProperty(
      "--shine-y",
      `${Math.round((y + 0.5) * 100)}%`,
    );
  }

  function resetCardTilt(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--shine-x", "50%");
    event.currentTarget.style.setProperty("--shine-y", "0%");
  }

  function playCinematicSequence() {
    const context = audioContext.current ?? new AudioContext();
    audioContext.current = context;
    void context.resume();

    const start = context.currentTime + 0.02;
    const master = context.createGain();
    master.gain.setValueAtTime(0.16, start);
    master.connect(context.destination);

    const activation = context.createOscillator();
    const activationGain = context.createGain();
    activation.type = "sine";
    activation.frequency.setValueAtTime(170, start);
    activation.frequency.exponentialRampToValueAtTime(620, start + 0.48);
    activationGain.gain.setValueAtTime(0.0001, start);
    activationGain.gain.exponentialRampToValueAtTime(0.22, start + 0.04);
    activationGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.58);
    activation.connect(activationGain).connect(master);
    activation.start(start);
    activation.stop(start + 0.6);

    const noiseBuffer = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * 2.5),
      context.sampleRate,
    );
    const noiseData = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseData.length; index += 1) {
      noiseData[index] = (Math.random() * 2 - 1) * (1 - index / noiseData.length);
    }
    const movement = context.createBufferSource();
    const movementFilter = context.createBiquadFilter();
    const movementGain = context.createGain();
    movement.buffer = noiseBuffer;
    movementFilter.type = "bandpass";
    movementFilter.frequency.setValueAtTime(420, start + 0.12);
    movementFilter.frequency.exponentialRampToValueAtTime(1550, start + 1.7);
    movementFilter.frequency.exponentialRampToValueAtTime(520, start + 2.55);
    movementFilter.Q.setValueAtTime(0.7, start);
    movementGain.gain.setValueAtTime(0.0001, start);
    movementGain.gain.exponentialRampToValueAtTime(0.13, start + 0.35);
    movementGain.gain.exponentialRampToValueAtTime(0.0001, start + 2.55);
    movement.connect(movementFilter).connect(movementGain).connect(master);
    movement.start(start + 0.1);
    movement.stop(start + 2.65);

    const moonSwell = context.createOscillator();
    const moonGain = context.createGain();
    moonSwell.type = "triangle";
    moonSwell.frequency.setValueAtTime(165, start + 1.15);
    moonSwell.frequency.exponentialRampToValueAtTime(330, start + 2.75);
    moonGain.gain.setValueAtTime(0.0001, start + 1.15);
    moonGain.gain.exponentialRampToValueAtTime(0.09, start + 1.9);
    moonGain.gain.exponentialRampToValueAtTime(0.0001, start + 2.9);
    moonSwell.connect(moonGain).connect(master);
    moonSwell.start(start + 1.15);
    moonSwell.stop(start + 2.95);

    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const note = context.createOscillator();
      const noteGain = context.createGain();
      const noteStart = start + 3.02 + index * 0.07;
      note.type = "sine";
      note.frequency.setValueAtTime(frequency, noteStart);
      noteGain.gain.setValueAtTime(0.0001, noteStart);
      noteGain.gain.exponentialRampToValueAtTime(0.13, noteStart + 0.035);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.72);
      note.connect(noteGain).connect(master);
      note.start(noteStart);
      note.stop(noteStart + 0.75);
    });
  }

  function playAircraftSequence(context: AudioContext) {
    const start = context.currentTime + 0.62;
    const master = context.createGain();
    master.gain.setValueAtTime(0.13, start);
    master.connect(context.destination);

    const engine = context.createOscillator();
    const engineBody = context.createGain();
    const engineFilter = context.createBiquadFilter();
    engine.type = "sawtooth";
    engine.frequency.setValueAtTime(58, start);
    engine.frequency.exponentialRampToValueAtTime(46, start + 4.3);
    engine.frequency.exponentialRampToValueAtTime(34, start + 5.55);
    engineBody.gain.setValueAtTime(0.0001, start);
    engineBody.gain.exponentialRampToValueAtTime(0.2, start + 0.24);
    engineBody.gain.setValueAtTime(0.2, start + 4.2);
    engineBody.gain.exponentialRampToValueAtTime(0.32, start + 5.25);
    engineBody.gain.exponentialRampToValueAtTime(0.0001, start + 6.18);
    engineFilter.type = "lowpass";
    engineFilter.frequency.setValueAtTime(280, start);
    engineFilter.frequency.exponentialRampToValueAtTime(520, start + 5.2);
    engine.connect(engineFilter).connect(engineBody).connect(master);
    engine.start(start);
    engine.stop(start + 6.2);

    const pressureBuffer = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * 6.1),
      context.sampleRate,
    );
    const pressureData = pressureBuffer.getChannelData(0);
    for (let index = 0; index < pressureData.length; index += 1) {
      pressureData[index] = Math.random() * 2 - 1;
    }
    const pressure = context.createBufferSource();
    const pressureFilter = context.createBiquadFilter();
    const pressureGain = context.createGain();
    pressure.buffer = pressureBuffer;
    pressureFilter.type = "lowpass";
    pressureFilter.frequency.setValueAtTime(180, start);
    pressureFilter.frequency.exponentialRampToValueAtTime(950, start + 5.15);
    pressureFilter.frequency.exponentialRampToValueAtTime(260, start + 6.05);
    pressureGain.gain.setValueAtTime(0.0001, start);
    pressureGain.gain.exponentialRampToValueAtTime(0.055, start + 1.1);
    pressureGain.gain.exponentialRampToValueAtTime(0.2, start + 5.18);
    pressureGain.gain.exponentialRampToValueAtTime(0.0001, start + 6.08);
    pressure.connect(pressureFilter).connect(pressureGain).connect(master);
    pressure.start(start);
    pressure.stop(start + 6.1);

    const touchdown = start + 5.34;
    const impact = context.createOscillator();
    const impactGain = context.createGain();
    impact.type = "sine";
    impact.frequency.setValueAtTime(92, touchdown);
    impact.frequency.exponentialRampToValueAtTime(38, touchdown + 0.38);
    impactGain.gain.setValueAtTime(0.0001, touchdown);
    impactGain.gain.exponentialRampToValueAtTime(0.38, touchdown + 0.018);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, touchdown + 0.55);
    impact.connect(impactGain).connect(master);
    impact.start(touchdown);
    impact.stop(touchdown + 0.58);

    [214, 287].forEach((frequency, index) => {
      const settling = context.createOscillator();
      const settlingGain = context.createGain();
      const settleStart = touchdown + 0.24 + index * 0.13;
      settling.type = "triangle";
      settling.frequency.setValueAtTime(frequency, settleStart);
      settling.frequency.exponentialRampToValueAtTime(
        frequency * 0.72,
        settleStart + 0.32,
      );
      settlingGain.gain.setValueAtTime(0.0001, settleStart);
      settlingGain.gain.exponentialRampToValueAtTime(0.08, settleStart + 0.015);
      settlingGain.gain.exponentialRampToValueAtTime(
        0.0001,
        settleStart + 0.38,
      );
      settling.connect(settlingGain).connect(master);
      settling.start(settleStart);
      settling.stop(settleStart + 0.4);
    });
  }

  async function activateAircraftSequence() {
    if (aircraftSoundPlayed.current) return;
    aircraftSoundPlayed.current = true;

    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      await context.resume();

      setSceneActivated(true);
      playAircraftSequence(context);
    } catch {
      aircraftSoundPlayed.current = false;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password || loginState !== "idle") return;

    timers.current.forEach(clearTimeout);
    timers.current = [];
    setHelperMessage("");
    setLoginState("loading");
    playCinematicSequence();

    timers.current.push(
      setTimeout(() => setLoginState("success"), 3600),
    );
  }

  function showDemoMessage(message: string) {
    setHelperMessage(message);
    timers.current.push(setTimeout(() => setHelperMessage(""), 3000));
  }

  return (
    <main
      className="lunara-page"
      onPointerDownCapture={activateAircraftSequence}
      onTouchStartCapture={activateAircraftSequence}
    >
      <div
        className={`scene ${sceneActivated ? "is-activated" : ""}`}
        aria-hidden="true"
      >
        <div className="scene-image">
          <div className="lander-sequence">
            <span className="lander-probe" />
            <span className="lander-thruster lander-thruster-left" />
            <span className="lander-thruster lander-thruster-right" />
            <span className="lander-engine-glow" />
            <span className="lander-dust lander-dust-left" />
            <span className="lander-dust lander-dust-right" />
            <span className="lander-smoke smoke-one" />
            <span className="lander-smoke smoke-two" />
            <span className="lander-smoke smoke-three" />
            <span className="lander-smoke smoke-four" />
            <span className="lander-smoke smoke-five" />
            <span className="lander-dust-wave" />
            <span className="lander-dust-wave lander-dust-wave-secondary" />
            <span className="lander-shadow" />
          </div>
        </div>
        <div className="scene-vignette" />
        <div className="moon-haze" />
        <div className="stars">
          {stars.map(([left, top, size, delay], index) => (
            <i
              key={index}
              style={
                {
                  "--left": `${left}%`,
                  "--top": `${top}%`,
                  "--size": `${size}px`,
                  "--delay": `${delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <span className="shooting-star shooting-star-one" />
        <span className="shooting-star shooting-star-two" />
        <span className="shooting-star shooting-star-three" />
        <span className="shooting-star shooting-star-four" />
        <span className="shooting-star shooting-star-five" />
        <span className="shooting-star shooting-star-six" />
        <span className="shooting-star shooting-star-seven" />
        <span className="shooting-star shooting-star-eight" />
        <span className="shooting-star shooting-star-nine" />
        <span className="shooting-star shooting-star-ten" />
        <span className="shooting-star shooting-star-eleven" />
        <span className="shooting-star shooting-star-twelve" />
        <span className="satellite">
          <i className="satellite-body" />
          <i className="satellite-panel panel-left" />
          <i className="satellite-panel panel-right" />
        </span>
        <div className="lunar-dust" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <i
              key={index}
              style={
                {
                  "--dust-x": `${3 + index * 8.1}%`,
                  "--dust-bottom": `${4 + index * 3}px`,
                  "--dust-duration": `${8 + index * 0.7}s`,
                  "--dust-delay": `${index * -0.9}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div className="foreground-mist mist-one" />
        <div className="foreground-mist mist-two" />
      </div>

      <section className="login-stage" aria-label="x7rG Enterprise sign in">
        <div
          className="tilt-shell"
          onPointerMove={handleCardMove}
          onPointerLeave={resetCardTilt}
        >
          <div className={`login-card card-${loginState}`}>
            <div className="card-shine" aria-hidden="true" />

            <header className="login-header">
              <div className="brand">
                <span className="brand-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M13.7 3.1c2.9-.7 5.7-.4 7.2.1.5 1.5.8 4.3.1 7.2-.7 2.8-2.6 5.5-5.2 7.4l-3.6-1-2.9-2.9-1-3.6c1.9-2.6 4.6-4.5 7.4-5.2Z" />
                    <circle cx="16.2" cy="7.8" r="2.1" />
                    <path d="m9.4 13.6-3.8.8-2.5 2.5 5.3.6m2.1-2.1-.8 3.8-2.5 2.5-.6-5.3" />
                    <path className="brand-flame" d="M7.3 16.8c-1.7.3-3.1 1.4-3.8 3.2 1.8-.7 2.9-2.1 3.2-3.8" />
                  </svg>
                </span>
                <span>x7rG Enterprise</span>
              </div>
              <h1>Welcome back</h1>
              <p>Sign in to continue to x7rG Enterprise</p>
            </header>

            <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                inputMode="email"
                placeholder="raganar@ragnar.com"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="field password-field">
              <span>Password</span>
              <input
                autoComplete="current-password"
                placeholder="ragnar"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className={`password-toggle ${showPassword ? "is-visible" : ""}`}
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <span className="eye-icon" aria-hidden="true" />
              </button>
            </label>

            <div className="form-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span className="custom-checkbox" aria-hidden="true">
                  ✓
                </span>
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  showDemoMessage("Password recovery is ready to connect.")
                }
              >
                Forgot password?
              </button>
            </div>

            <button
              className={`login-button is-${loginState}`}
              type="submit"
              disabled={loginState !== "idle"}
            >
              <span className="button-label">
                {loginState === "success" ? (
                  <span className="success-content">
                    <span className="success-check" aria-hidden="true">✓</span>
                    <span>Access granted</span>
                  </span>
                ) : (
                  "Sign in"
                )}
              </span>

              {loginState !== "success" && (
                <span className="bicycle-scene" aria-hidden="true">
                  <i className="bicycle-moon" />
                  <i className="bicycle-flight-trail" />
                  <span className="bicycle-flight">
                    <i className="bike-reference-art" />
                    <i className="bike-wheel-motion bike-wheel-motion-rear" />
                    <i className="bike-wheel-motion bike-wheel-motion-front" />
                    <i className="bike-dust bike-dust-one" />
                    <i className="bike-dust bike-dust-two" />
                    <i className="bike-dust bike-dust-three" />
                  </span>
                </span>
              )}
            </button>

            <p
              className={`form-status status-${loginState}`}
              aria-live="polite"
            >
              {loginState === "loading"
                ? "Signing you in..."
                : loginState === "success"
                  ? "Welcome aboard."
                  : helperMessage}
            </p>
            </form>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <div className="social-grid">
              <button
                type="button"
                className="social-button"
                onClick={() =>
                  showDemoMessage("Google sign-in is ready to connect.")
                }
              >
                <svg className="social-logo" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"/>
                  <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"/>
                  <path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.53l3.35-2.61Z"/>
                  <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="social-button"
                onClick={() =>
                  showDemoMessage("Apple sign-in is ready to connect.")
                }
              >
                <svg className="social-logo apple-logo" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M17.05 12.54c-.02-2.28 1.86-3.39 1.94-3.44a4.16 4.16 0 0 0-3.28-1.78c-1.38-.15-2.72.83-3.42.83-.71 0-1.79-.82-2.95-.79a4.35 4.35 0 0 0-3.66 2.23c-1.59 2.75-.4 6.8 1.11 9.02.76 1.09 1.65 2.3 2.81 2.26 1.14-.05 1.57-.73 2.94-.73 1.36 0 1.76.73 2.95.7 1.22-.02 1.99-1.09 2.72-2.19a9 9 0 0 0 1.24-2.53 3.93 3.93 0 0 1-2.4-3.58ZM14.81 5.86a4 4 0 0 0 .92-2.87 4.08 4.08 0 0 0-2.65 1.36 3.82 3.82 0 0 0-.94 2.76 3.37 3.37 0 0 0 2.67-1.25Z"/>
                </svg>
                Apple
              </button>
            </div>

            <p className="signup-copy">
              New to x7rG Enterprise?{" "}
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  showDemoMessage("Account creation is ready to connect.")
                }
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
