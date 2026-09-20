import { Bell, Search } from "lucide-react";

import "./Topbar.css";

function Topbar(
    {
        title = "Tableau de bord",
        subtitle = "Bienvenue dans votre espace AYO TradeFlow.",
    }
) {
  return (
    <header className="topbar">
      <div className="topbar-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Rechercher..."
            aria-label="Rechercher"
          />
        </div>

        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="notification-dot" />
        </button>

        <div className="topbar-profile">
          <div className="profile-avatar">AB</div>

          <div className="profile-details">
            <strong>Ayoub Bouaziz</strong>
            <span>Administrateur</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;