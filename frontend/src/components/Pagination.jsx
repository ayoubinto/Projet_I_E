import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

function getPageList(currentPage, totalPages) {
  const pages = [];
  const addRange = (start, end) => {
    for (let i = start; i <= end; i++) pages.push(i);
  };

  if (totalPages <= 7) {
    addRange(1, totalPages);
    return pages;
  }

  pages.push(1);

  if (currentPage <= 4) {
    addRange(2, 5);
    pages.push("...");
  } else if (currentPage >= totalPages - 3) {
    pages.push("...");
    addRange(totalPages - 4, totalPages - 1);
  } else {
    pages.push("...");
    addRange(currentPage - 1, currentPage + 1);
    pages.push("...");
  }

  pages.push(totalPages);
  return pages;
}

// Composant contrôlé : le parent possède currentPage / setCurrentPage.
//
// Exemple d'utilisation :
//
//   const elementsParPage = 10;
//   const entries = Object.entries(operations ?? {});
//   const nombrePage = Math.ceil(entries.length / elementsParPage);
//   const [currentPage, setCurrentPage] = useState(1);
//
//   <Pagination
//     nombrePage={nombrePage}
//     currentPage={currentPage}
//     setCurrentPage={setCurrentPage}
//   />

export default function Pagination({ nombrePage, currentPage, setCurrentPage }) {
  const totalPages = Math.max(nombrePage, 1);

  // Rien à paginer, ou une seule page : pas besoin d'afficher les contrôles.
  if (totalPages <= 1) return null;

  const pageList = getPageList(currentPage, totalPages);

  const goTo = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  return (
    <div
      className="pagination"
      role="navigation"
      aria-label={`Page ${currentPage} sur ${totalPages}`}
    >
      <button
        type="button"
        className="pagination-nav"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Page précédente"
      >
        <ChevronLeft size={17} strokeWidth={2.25} />
      </button>

      {pageList.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
            ⋯
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={`pagination-btn ${page === currentPage ? "active" : ""}`}
            onClick={() => goTo(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination-nav"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
      >
        <ChevronRight size={17} strokeWidth={2.25} />
      </button>
    </div>
  );
}
