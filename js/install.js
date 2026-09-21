/* =========================================================
   INSTALL.JS — Banner de instalação do PWA
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

  /* ---------- Verificações ---------- */
  function estaInstalado() {
    // Android/desktop
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    // iOS Safari
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

  /* ---------- Mostrar banner ---------- */
  function mostrarBanner() {
    if (estaInstalado()) return;
    if (foiDispensado()) return;
    if (!isMobile()) return;

    banner.classList.add("visivel");
  }

  function esconderBanner() {
    banner.classList.remove("visivel");
  }

  /* ---------- Evento beforeinstallprompt (Android/Chrome) ---------- */
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Só mostra o banner quando o navegador confirma que é instalável
    mostrarBanner();
  });

  /* ---------- iOS: mostra instruções direto (não tem beforeinstallprompt) ---------- */
  // Espera um pouco pra não aparecer na cara do cliente assim que abre
  if (isIOS() && isSafari() && !estaInstalado() && !foiDispensado()) {
    setTimeout(mostrarBanner, 4000);
  }

  /* ---------- Clique em Instalar ---------- */
  btnInstalar.addEventListener("click", async () => {
    // Android/Chrome — usa o prompt nativo
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === "accepted") {
        esconderBanner();
        localStorage.removeItem(STORAGE_KEY);
      }
      return;
    }

    // iOS — mostra instruções
    if (isIOS()) {
      modalIOS.classList.add("aberto");
      return;
    }
  });

  /* ---------- Fechar banner ---------- */
  btnFechar.addEventListener("click", () => {
    esconderBanner();
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (e) {}
  });

  /* ---------- Fechar modal iOS ---------- */
  btnFecharIOS.addEventListener("click", () => {
    modalIOS.classList.remove("aberto");
    // Ao fechar o modal do iOS, também marca como dispensado
    esconderBanner();
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (e) {}
  });

  modalIOS.addEventListener("click", (e) => {
    if (e.target === modalIOS) {
      modalIOS.classList.remove("aberto");
    }
  });

  /* ---------- Detecta quando o app foi instalado ---------- */
  window.addEventListener("appinstalled", () => {
    esconderBanner();
    deferredPrompt = null;
    localStorage.removeItem(STORAGE_KEY);
  });
})();