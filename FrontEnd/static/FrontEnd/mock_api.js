/**
 * MOCK API — Temporary fake REST API for development
 * Replace calls to `MockAPI.*` with real fetch() calls to your Django endpoints.
 *
 * Simulated endpoints:
 *   GET    /api/recursos/          → MockAPI.getRecursos()
 *   GET    /api/recursos/:id/      → MockAPI.getRecurs(id)
 *   POST   /api/recursos/          → MockAPI.createRecurs(data)
 *   GET    /api/autors/            → MockAPI.getAutors()
 *   GET    /api/autors/:id/        → MockAPI.getAutor(id)
 *   POST   /api/autors/            → MockAPI.createAutor(data)
 */

const MockAPI = (() => {
  // ── Seed data ──────────────────────────────────────────────────────────────
  let _recursos = [
    {
      id: 1,
      titol: "Introducció a la Intel·ligència Artificial",
      descripcio: "Una guia completa per entendre els fonaments de la IA, incloent aprenentatge automàtic, xarxes neuronals i aplicacions pràctiques en l'educació i la indústria.",
      categoria: "TEC",
      data_publicacio: "2024-03-15T09:00:00Z",
      is_activ: true,
    },
    {
      id: 2,
      titol: "Metodologies d'Aprenentatge Actiu",
      descripcio: "Recull de tècniques pedagògiques per fomentar la participació activa de l'alumnat a l'aula, amb exemples pràctics i avaluació de resultats.",
      categoria: "EDU",
      data_publicacio: "2024-01-20T10:30:00Z",
      is_activ: true,
    },
    {
      id: 3,
      titol: "Benestar Mental en l'Entorn Acadèmic",
      descripcio: "Estratègies i recursos per promoure la salut mental dels estudiants i docents, amb enfocament en la gestió de l'estrès i la resiliència.",
      categoria: "SAL",
      data_publicacio: "2023-11-05T14:00:00Z",
      is_activ: true,
    },
    {
      id: 4,
      titol: "Cinema Documental Europeu Contemporani",
      descripcio: "Anàlisi de les tendències actuals en el documental europeu, amb fitxes de les obres més destacades dels últims cinc anys.",
      categoria: "ENT",
      data_publicacio: "2024-02-28T16:45:00Z",
      is_activ: false,
    },
    {
      id: 5,
      titol: "Accés Obert i Publicació Científica",
      descripcio: "Tot el que necessites saber sobre les polítiques d'accés obert, repositoris institucionals i com publicar en revistes d'impacte.",
      categoria: "ALT",
      data_publicacio: "2024-04-01T08:00:00Z",
      is_activ: true,
    },
  ];

  let _autors = [
    {
      id: 1,
      nom: "Marta",
      cognoms: "Puigdomènech Roca",
      email: "m.puigdomenech@universitat.cat",
      data_naixement: "1982-07-14",
      càrrec: "Professora Titular",
    },
    {
      id: 2,
      nom: "Jordi",
      cognoms: "Esquerra Viladomat",
      email: "j.esquerra@recerca.cat",
      data_naixement: "1975-02-28",
      càrrec: "Investigador Principal",
    },
    {
      id: 3,
      nom: "Núria",
      cognoms: "Fontanals Bosch",
      email: "n.fontanals@educacio.org",
      data_naixement: "1990-11-03",
      càrrec: "Coordinadora de Projectes",
    },
    {
      id: 4,
      nom: "Pau",
      cognoms: "Castells Montserrat",
      email: "p.castells@tech.cat",
      data_naixement: "1988-05-19",
      càrrec: "Enginyer de Recerca",
    },
  ];

  let _nextRecursId = 6;
  let _nextAutorId = 5;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    // RECURSOS
    async getRecursos() {
      await delay();
      return { ok: true, data: deepClone(_recursos) };
    },

    async getRecurs(id) {
      await delay();
      const item = _recursos.find((r) => r.id === Number(id));
      if (!item) return { ok: false, error: "Recurs no trobat" };
      return { ok: true, data: deepClone(item) };
    },

    async createRecurs(data) {
      await delay(500);
      const errors = {};
      if (!data.titol?.trim()) errors.titol = "El títol és obligatori.";
      if (!data.categoria) errors.categoria = "La categoria és obligatoria.";
      if (Object.keys(errors).length) return { ok: false, errors };

      const newItem = {
        id: _nextRecursId++,
        titol: data.titol.trim(),
        descripcio: data.descripcio?.trim() || null,
        categoria: data.categoria,
        data_publicacio: new Date().toISOString(),
        is_activ: data.is_activ !== undefined ? Boolean(data.is_activ) : true,
      };
      _recursos.unshift(newItem);
      return { ok: true, data: deepClone(newItem) };
    },

    // AUTORS
    async getAutors() {
      await delay();
      return { ok: true, data: deepClone(_autors) };
    },

    async getAutor(id) {
      await delay();
      const item = _autors.find((a) => a.id === Number(id));
      if (!item) return { ok: false, error: "Autor no trobat" };
      return { ok: true, data: deepClone(item) };
    },

    async createAutor(data) {
      await delay(500);
      const errors = {};
      if (!data.nom?.trim()) errors.nom = "El nom és obligatori.";
      if (!data.cognoms?.trim()) errors.cognoms = "Els cognoms són obligatoris.";
      if (!data.email?.trim()) errors.email = "El correu és obligatori.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        errors.email = "El format del correu no és vàlid.";
      else if (_autors.some((a) => a.email === data.email.trim()))
        errors.email = "Aquest correu ja existeix.";
      if (Object.keys(errors).length) return { ok: false, errors };

      const newItem = {
        id: _nextAutorId++,
        nom: data.nom.trim(),
        cognoms: data.cognoms.trim(),
        email: data.email.trim(),
        data_naixement: data.data_naixement || null,
        càrrec: data.càrrec?.trim() || null,
      };
      _autors.unshift(newItem);
      return { ok: true, data: deepClone(newItem) };
    },
  };
})();
