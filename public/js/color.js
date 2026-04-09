function loadDarkMode() {
  if (getCookie("cc_dark") === "1")
    applyDark(true);
}

function toggleDark() {
  applyDark(!document.body.classList.contains("dark"));
}

function applyDark(on) {
  document.body.classList.toggle("dark", on);
  document.getElementById("iconMoon").style.display = on ? "none" : "";
  document.getElementById("iconSun").style.display = on ? "" : "none";
  setCookie("cc_dark", on ? "1" : "0", 365);
}
