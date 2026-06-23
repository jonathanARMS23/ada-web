#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  ADA — Bootstrap Installer
#
#  Usage:
#    # CLI seulement
#    curl -fsSL https://ada.byarms.com/install.sh | bash
#
#    # CLI + ada-api + ada-ui (recommandé)
#    curl -fsSL https://ada.byarms.com/install.sh | bash -s -- --with-server
#
#  Ce script :
#    1. Vérifie les prérequis (Node 22+, curl, unzip)
#    2. Télécharge la dernière release depuis GitHub
#    3. Extrait l'archive dans /tmp/ada-install
#    4. Exécute l'installeur interne (install.sh [--with-server])
#    5. Configure le PATH si nécessaire
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
GITHUB_REPO="jonathanARMS23/AI-Dev-Assistant"
# ADA_BASE_URL peut être surchargé pour tester sans domaine configuré :
#   ADA_BASE_URL=http://95.216.187.73 curl ... | bash -s -- --with-server
ADA_BASE_URL="${ADA_BASE_URL:-https://ada.byarms.com}"
FALLBACK_ZIP_URL="${ADA_BASE_URL}/ADA-v7.zip"
INSTALL_PREFIX="${ADA_INSTALL_PREFIX:-$HOME/.ada}"

# ─── Couleurs ────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; CYAN=''; BOLD=''; DIM=''; NC=''
fi

log_step()  { echo -e "${CYAN}→${NC} $*"; }
log_ok()    { echo -e "${GREEN}✓${NC} $*"; }
log_warn()  { echo -e "${YELLOW}⚠${NC} $*"; }
log_error() { echo -e "${RED}✗${NC} $*" >&2; }

# ─── Banner ──────────────────────────────────────────────────────────────────
print_banner() {
  echo
  echo -e "${CYAN}${BOLD}   ╔═══╗╔═══╗╔═══╗${NC}"
  echo -e "${CYAN}${BOLD}   ║╔═╗║╚╗╔╗║║╔═╗║${NC}"
  echo -e "${CYAN}${BOLD}   ║║─║║─║║║║║║─║║${NC}"
  echo -e "${CYAN}${BOLD}   ║╔═╗║─║║║║║╚═╝║${NC}"
  echo -e "${CYAN}${BOLD}   ║║─║║╔╝╚╝║║╔══╝${NC}"
  echo -e "${CYAN}${BOLD}   ╚╝─╚╝╚═══╝╚╝${NC}"
  echo -e "${BOLD}   AI Dev Assistant — Installer${NC}"
  echo -e "${DIM}   github.com/${GITHUB_REPO}${NC}"
  echo
}

# ─── Arguments ───────────────────────────────────────────────────────────────
WITH_SERVER=false
for arg in "$@"; do
  [[ "$arg" == "--with-server" ]] && WITH_SERVER=true
  [[ "$arg" == "--help" ]] && {
    echo "Usage: curl -fsSL https://ada.byarms.com/install.sh | bash -s -- [--with-server]"
    echo "  --with-server    Install ada-api + ada-ui in addition to ada-core CLI"
    exit 0
  }
done

# ─── Prérequis ───────────────────────────────────────────────────────────────
check_prereqs() {
  local MISSING=()

  # curl
  command -v curl  &>/dev/null || MISSING+=("curl")
  # unzip
  command -v unzip &>/dev/null || MISSING+=("unzip")

  if [ ${#MISSING[@]} -gt 0 ]; then
    log_error "Dépendances manquantes : ${MISSING[*]}"
    echo "  macOS : brew install ${MISSING[*]}"
    echo "  Linux : apt install ${MISSING[*]} / yum install ${MISSING[*]}"
    exit 1
  fi
  log_ok "Dépendances : curl, unzip"

  # Node.js
  if ! command -v node &>/dev/null; then
    log_error "Node.js introuvable"
    echo "  Installer Node.js 22 via nvm :"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
    echo "  nvm install 22 && nvm use 22"
    exit 1
  fi

  local NODE_MAJOR
  NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
  if [[ "$NODE_MAJOR" -lt 22 ]]; then
    log_error "Node.js 22+ requis — version actuelle : $(node --version)"
    echo "  nvm install 22 && nvm use 22"
    exit 1
  fi
  log_ok "Node.js $(node --version)"
}

# ─── Téléchargement ──────────────────────────────────────────────────────────
get_download_url() {
  # Tente d'obtenir l'URL de la dernière release GitHub
  local API_URL="https://api.github.com/repos/${GITHUB_REPO}/releases/latest"
  local RELEASE_JSON

  if RELEASE_JSON=$(curl -fsSL --connect-timeout 5 "$API_URL" 2>/dev/null); then
    local ZIP_URL
    ZIP_URL=$(echo "$RELEASE_JSON" | grep '"browser_download_url"' | grep '\.zip"' | head -1 | sed 's/.*"browser_download_url": "\(.*\)".*/\1/')
    if [ -n "$ZIP_URL" ]; then
      echo "$ZIP_URL"
      return 0
    fi
  fi

  # Secours : zip hébergé sur ada-web
  log_warn "GitHub API inaccessible → utilisation de l'URL de secours"
  echo "$FALLBACK_ZIP_URL"
}

download_and_extract() {
  local URL="$1"
  local TMPDIR
  TMPDIR=$(mktemp -d)
  # Nettoyage automatique en cas d'erreur
  trap 'rm -rf "$TMPDIR"' ERR

  local ZIP_PATH="$TMPDIR/ada.zip"

  log_step "Téléchargement depuis $(echo "$URL" | sed 's|https://||' | cut -d/ -f1)..."
  if ! curl -fsSL --progress-bar -o "$ZIP_PATH" "$URL"; then
    log_error "Échec du téléchargement : $URL"
    exit 1
  fi

  local SIZE
  SIZE=$(du -h "$ZIP_PATH" | cut -f1)
  log_ok "Téléchargé ($SIZE)"

  log_step "Extraction..."
  unzip -q "$ZIP_PATH" -d "$TMPDIR"
  rm "$ZIP_PATH"

  # Trouver le dossier extrait (peut être ADA-v7, AI-Dev-Assistant, etc.)
  local EXTRACTED
  EXTRACTED=$(find "$TMPDIR" -maxdepth 1 -mindepth 1 -type d | head -1)

  if [ -z "$EXTRACTED" ]; then
    log_error "Impossible de trouver le dossier extrait dans l'archive"
    exit 1
  fi

  echo "$EXTRACTED"
}

# ─── Installation ────────────────────────────────────────────────────────────
run_installer() {
  local SRC_DIR="$1"

  if [ ! -f "$SRC_DIR/install.sh" ]; then
    log_error "install.sh introuvable dans l'archive : $SRC_DIR"
    ls "$SRC_DIR" >&2
    exit 1
  fi

  echo
  echo -e "${BOLD}━━━ Installation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  # Restaurer stdin depuis le terminal si on tourne dans un pipe curl | bash
  local INNER_ARGS=()
  [[ "$WITH_SERVER" == "true" ]] && INNER_ARGS+=("--with-server")

  if [ -t 0 ]; then
    # stdin normal (pas un pipe)
    bash "$SRC_DIR/install.sh" "${INNER_ARGS[@]:-}"
  else
    # stdin est un pipe → restaurer le terminal pour les prompts interactifs
    if [ -e /dev/tty ]; then
      bash "$SRC_DIR/install.sh" "${INNER_ARGS[@]:-}" < /dev/tty
    else
      # Pas de terminal disponible → mode non-interactif
      bash "$SRC_DIR/install.sh" "${INNER_ARGS[@]:-}" --noninteractive
    fi
  fi
}

# ─── Point d'entrée ──────────────────────────────────────────────────────────
main() {
  print_banner
  check_prereqs
  echo

  local DOWNLOAD_URL
  DOWNLOAD_URL=$(get_download_url)

  local EXTRACTED_DIR
  EXTRACTED_DIR=$(download_and_extract "$DOWNLOAD_URL")

  run_installer "$EXTRACTED_DIR"

  # Nettoyage
  local TMPDIR
  TMPDIR=$(dirname "$EXTRACTED_DIR")
  rm -rf "$TMPDIR"

  echo
  echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}${BOLD}  ✓ ADA installé avec succès${NC}"
  echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo
  if [[ "$WITH_SERVER" == "true" ]]; then
    echo -e "  ${CYAN}ada start server${NC}   — démarrer tous les services"
    echo -e "  ${CYAN}ada open${NC}           — ouvrir l'interface"
  else
    echo -e "  ${CYAN}ada run \"<tâche>\"${NC}  — lancer votre première tâche"
    echo -e "  ${CYAN}ada --help${NC}         — toutes les commandes"
  fi
  echo
}

main "$@"
