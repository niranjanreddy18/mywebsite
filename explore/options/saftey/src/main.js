import { DEFAULTS } from "./config.js";
    import { renderAll } from "./ui.js";

    function readParams() {
      const params = new URLSearchParams(location.search);
      return {
        country: params.get("country")?.trim() || DEFAULTS.country,
        city: params.get("city")?.trim() || DEFAULTS.city,
        month: params.get("month")?.trim() || DEFAULTS.month,
        nationality: params.get("nationality")?.trim() || DEFAULTS.nationality
      };
    }

    function mount() {
      const data = readParams();

      // Render guidance directly (no trip summary shown)
      renderAll(data);

      document.getElementById("refreshBtn").addEventListener("click", () => location.reload());
      document.getElementById("printBtn").addEventListener("click", () => window.print());
      document.getElementById("copyBtn").addEventListener("click", () => {
        navigator.clipboard?.writeText(location.href).then(() => {
          const btn = document.getElementById("copyBtn");
          const old = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(() => btn.textContent = old, 1400);
        }).catch(() => alert("Copy failed — please copy the URL manually."));
      });

      // If no country provided, adjust a subtle notice inside sources
      if (!data.country) {
        const src = document.getElementById("sourceLinks");
        const note = document.createElement("li");
        note.textContent = "No destination supplied via URL. Add ?country=Country to get tailored guidance.";
        src.insertBefore(note, src.firstChild);
      }
    }

    // Auto-init
    mount();
