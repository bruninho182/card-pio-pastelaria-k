/* =========================================================
   INSTALL.JS — Banner + botão no rodapé (PWA)
   ========================================================= */

(function () {
  const STORAGE_KEY = "pastelaria_install_dismissed";
  const DIAS_PARA_LEMBRAR = 7;

  let deferredPrompt = null;

  /* ---------- Elementos ---------- */
  const banner = document.getElementById("install-banner");
  const btnInstalar = document.getElementById("btn-instalar");
  const btnFechar = document.getElementById("btn-fechar-install");

  const modalIOS = document.getElementById("modal-ios");
  const btnFecharIOS = document.getElementById("btn-fechar-ios");
  const btnOkIOS = document.getElementById("btn-ok-ios");

  const btnInstalarFooter = document.getElementById("btn-instalar-footer");

  /* ---------- Verificações ---------- */
  function estaInstalado() {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if (window.navigator.standalone === true) return true;
    return false;
  }

  function foiDispensado() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = Number(raw);
      const dias = (Date.now() - data) / (1000 * 60 * 60 * 24);
      return dias < DIAS_PARA_LEMBRAR;
    } catch (e) {
      return false;
    }
  }

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function isSafari() {
    return /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
  }

  /* ---------- Banner (mobile only) ---------- */
  function mostrarBanner() {
    if (estaInstalado()) return;
    if (foiDispensado()) return;
    if (!isMobile()) return;
    banner.classList.add("visivel");
  }

  function esconderBanner() {
    banner.classList.remove("visivel");
  }

  /* ---------- Botão do footer (todas as plataformas) ---------- */
  function mostrarBotaoFooter() {
    if (estaInstalado()) return;
    if (btnInstalarFooter) btnInstalarFooter.classList.remove("hidden");
  }

  function esconderBotaoFooter() {
    if (btnInstalarFooter) btnInstalarFooter.classList.add("hidden");
  }

  /* ---------- beforeinstallprompt (Android/Chrome/Edge desktop) ---------- */
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    mostrarBanner();
    mostrarBotaoFooter();
  });

  /* ---------- iOS: mostra botão e banner (sem prompt nativo) ---------- */
  if (isIOS() && isSafari() && !estaInstalado()) {
    mostrarBotaoFooter();
    if (!foiDispensado()) {
      setTimeout(mostrarBanner, 4000);
    }
  }

  /* ---------- Firefox/Safari desktop: só botão com instrução ---------- */
  const ua = navigator.userAgent;
  const isFirefox = /firefox|fxios/i.test(ua);
  const isSafariDesktop =
    /safari/i.test(ua) && !/chrome|chromium|crios|android/i.test(ua);
  if (!isMobile() && (isFirefox || isSafariDesktop) && !estaInstalado()) {
    mostrarBotaoFooter();
  }

  /* =========================================================
     FUNÇÃO CENTRAL DE INSTALAÇÃO
     ========================================================= */
  window.instalarApp = async function () {
    // Android/Chrome/Edge → prompt nativo
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === "accepted") {
        esconderBanner();
        esconderBotaoFooter();
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
      }
      return;
    }

    // iOS → instruções
    if (isIOS()) {
      modalIOS.classList.add("aberto");
      return;
    }

    // Outros navegadores → instrução genérica
    alert(
      "Para instalar o app:\n\n" +
        "• Chrome/Edge: menu (⋮) → 'Instalar aplicativo'\n" +
        "• Safari (Mac): Arquivo → 'Adicionar ao Dock'\n" +
        "• Firefox: não suporta instalação de PWA — use Chrome ou Edge"
    );
  };

  /* ---------- Clique em Instalar (banner) ---------- */
  btnInstalar.addEventListener("click", () => window.instalarApp());

  /* ---------- Clique em Instalar (footer) ---------- */
  if (btnInstalarFooter) {
    btnInstalarFooter.addEventListener("click", () => window.instalarApp());
  }

  /* ---------- Fechar banner ---------- */
  btnFechar.addEventListener("click", () => {
    esconderBanner();
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (e) {}
  });

  /* ---------- Fechar modal iOS ---------- */
  function fecharModalIOS() {
    modalIOS.classList.remove("aberto");
    esconderBanner();
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (e) {}
  }

  btnFecharIOS.addEventListener("click", fecharModalIOS);
  if (btnOkIOS) btnOkIOS.addEventListener("click", fecharModalIOS);

  modalIOS.addEventListener("click", (e) => {
    if (e.target === modalIOS) {
      modalIOS.classList.remove("aberto");
    }
  });

  /* ---------- Detecta quando foi instalado ---------- */
  window.addEventListener("appinstalled", () => {
    esconderBanner();
    esconderBotaoFooter();
    deferredPrompt = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  });
})();