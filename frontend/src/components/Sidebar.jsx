import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Workflow,
  PlusCircle,
  BarChart3,
  Brain,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/logo.png";
import "./Sidebar.css";

// Liens principaux du menu (icône + libellé + route)
const mainLinks = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/operations", label: "Opérations", icon: Workflow },
  { to: "/operations/new", label: "Nouvelle opération", icon: PlusCircle },
  { to: "/analyses", label: "Analyses", icon: BarChart3 },
  { to: "/predictions", label: "Prédictions IA", icon: Brain },
  { to: "/reports", label: "Rapports", icon: FileText },
];

// Liens secondaires (bas de la sidebar)
const secondaryLinks = [
  { to: "/settings", label: "Paramètres", icon: Settings },
  { to: "/help", label: "Aide", icon: HelpCircle },
];

export default function Sidebar({ onLogout }) {
  // Mode réduit (icônes seules) — utile sur tablette
  const [collapsed, setCollapsed] = useState(false);
  // Ouverture du menu sur mobile (drawer + overlay)
  const [mobileOpen, setMobileOpen] = useState(false);

  // Classe appliquée par NavLink selon que le lien est actif ou non
  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? " active" : ""}`;

  return (
    <>
      {/* Bouton hamburger visible uniquement sur mobile */}
      <button
        className="mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu size={22} />
      </button>

      {/* Fond sombre affiché derrière la sidebar quand elle est ouverte sur mobile */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar${collapsed ? " collapsed" : ""}${
          mobileOpen ? " mobile-open" : ""
        }`}
      >
        {/* ---------- EN-TÊTE : LOGO + NOM ---------- */}
        <div className="sidebar-header">
          <div className="brand">
            <img src={logo} alt="AYO TradeFlow" className="brand-logo" />
            <span className="brand-name">AYO TradeFlow</span>
          </div>

          {/* Fermer le menu sur mobile */}
          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>

          {/* Réduire / étendre la sidebar (desktop / tablette) */}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Étendre le menu" : "Réduire le menu"}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        {/* ---------- MENU PRINCIPAL ---------- */}
        <nav className="sidebar-nav">
          <p className="nav-section-title">Menu principal</p>
          <ul className="nav-list">
            {mainLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass} title={label}>
                  <Icon size={19} className="nav-icon" />
                  <span className="nav-label">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---------- BAS DE SIDEBAR ---------- */}
        <div className="sidebar-footer">
          <ul className="nav-list">
            {secondaryLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass} title={label}>
                  <Icon size={19} className="nav-icon" />
                  <span className="nav-label">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Zone utilisateur */}
          <div className="user-zone">
            <div className="avatar">AB</div>
            <div className="user-info">
              <span className="user-name">Ayoub Bouaziz</span>
              <span className="user-role">Administrateur</span>
            </div>
          </div>

          {/* Bouton de déconnexion */}
          <button className="logout-btn" onClick={onLogout} title="Déconnexion">
            <LogOut size={19} className="nav-icon" />
            <span className="nav-label">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
