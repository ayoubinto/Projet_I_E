import { useState } from "react";
import { User, Lock, Eye, EyeOff,Check,ArrowRight,AlertCircle, Plane, Ship } from "lucide-react";
import "./Login.css";
import logo from "../assets/dd.png";
import logo_b from "../assets/logo.png";
import api from '../services/api.js'
import { useNavigate} from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Veuillez renseigner votre nom d'utilisateur et votre mot de passe.");
      return;
    }

    setLoading(true);

    try{
      const response = await api.post("/token/",{
        username:username.trim(),
        password:password.trim(),
      });
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      otherStorage.removeItem("accessToken");
      otherStorage.removeItem("refreshToken");

      storage.setItem("accessToken",response.data.access);
      storage.setItem("refreshToken",response.data.refresh);
      console.log("Connexion réussie");
      navigate("/dashboard", {replace: true});
    }catch (error){
      if(error.response?.status === 401){
        setError("Nom d'utilisateur ou mot de passe incorrect.")
      }else{
        setError("Impossible de contacter le serveur Django.")
      }
    }finally {
      setLoading(false)
    }
    setTimeout(() => {
      setLoading(false);
      setError("Nom d'utilisateur ou mot de passe incorrect. Veuillez réessayer.");
    }, 1000);
  };

  return (
    <div className="mer-root">
      {/* ---------- LEFT: VISUAL IDENTITY ---------- */}
      <div className="visual-panel">
        <div className="brand">
          <img
            src={logo}
            alt="Logo AYO TradeFlow"
            className="login-logo"
          />
          <span>AYO TradeFlow<span className="brand-name-accent">.</span></span>
        </div>

        <div className="globe-wrap" >
          <svg viewBox="0 0 400 320" width="100%" height="auto" role="img" aria-label="Illustration d'un globe avec routes commerciales">
            <circle cx="200" cy="150" r="108" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" />
            <ellipse cx="200" cy="150" rx="108" ry="38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <ellipse cx="200" cy="150" rx="60" ry="108" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <ellipse cx="200" cy="150" rx="94" ry="108" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
            <line x1="92" y1="150" x2="308" y2="150" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

            <path className="route-path" d="M 130 100 Q 200 40 275 95" fill="none" stroke="#2ee6c8" strokeWidth="1.6" opacity="0.8" />
            <path className="route-path" d="M 120 190 Q 200 250 290 185" fill="none" stroke="#4fa9e8" strokeWidth="1.6" opacity="0.8" />
            <path className="route-path" d="M 105 150 Q 150 120 210 160 Q 250 185 300 150" fill="none" stroke="#4fa9e8" strokeWidth="1.4" opacity="0.55" />

            <circle className="route-dot" cx="130" cy="100" r="4" fill="#2ee6c8" />
            <circle className="route-dot d2" cx="275" cy="95" r="4" fill="#2ee6c8" />
            <circle className="route-dot d3" cx="120" cy="190" r="4" fill="#4fa9e8" />
            <circle className="route-dot d4" cx="290" cy="185" r="4" fill="#4fa9e8" />
            <circle className="route-dot d2" cx="210" cy="160" r="3.5" fill="#ffffff" />
          </svg>

          <div className="floater" style={{ top: "6%", left: "4%" }}>
            <Ship size={26} color="#4fa9e8" strokeWidth={1.8} />
          </div>
          <div className="floater plane" style={{ top: "62%", right: "2%" }}>
            <Plane size={24} color="#2ee6c8" strokeWidth={1.8} />
          </div>
        </div>

        <div className="visual-copy">
          <h1>Gérez intelligemment vos opérations import-export</h1>
          <p>
            Centralisez vos opérations, analysez les coûts et améliorez vos
            décisions grâce à l'intelligence artificielle.
          </p>
        </div>

        <div className="visual-footer">
          <span>+40 pays connectés</span>
          <span>Suivi en temps réel</span>
          <span>Analyse assistée par IA</span>
        </div>
      </div>

      {/* ---------- RIGHT: LOGIN FORM ---------- */}
      <div className="form-panel">
        <div className="login-card">
          <div className="card-badge">
            <img
              src={logo_b}
              alt="Logo AYO TradeFlow"
              className="login-logo_b"
            />
          </div>
          <h2 className="card-title">Bienvenue</h2>
          <p className="card-subtitle">Connectez-vous pour accéder à votre espace</p>

          {error && (
            <div className="error-box" role="alert">
              <AlertCircle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="username">Nom d'utilisateur</label>
              <div className={`field-wrap ${focusField === "username" ? "is-focused" : ""} ${error ? "has-error" : ""}`}>
                <span className="field-icon"><User size={17} /></span>
                <input
                  id="username"
                  type="text"
                  className="field-input"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusField("username")}
                  onBlur={() => setFocusField("")}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Mot de passe</label>
              <div className={`field-wrap ${focusField === "password" ? "is-focused" : ""} ${error ? "has-error" : ""}`}>
                <span className="field-icon"><Lock size={17} /></span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="field-input"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField("")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="row-between">
              <label className="remember-label">
                <input
                  type="checkbox"
                  className="checkbox-native"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className={`custom-checkbox ${rememberMe ? "checked" : ""}`}>
                  <Check size={13} strokeWidth={3} />
                </span>
                Se souvenir de moi
              </label>
              <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
                Mot de passe oublié ?
              </a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Connexion..." : "Se connecter"}
              {!loading && (
                <span className="btn-arrow">
                  <ArrowRight size={17} />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
