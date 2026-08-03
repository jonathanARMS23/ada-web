#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  ADA — Bootstrap Installer
#
#  Usage:
#    # CLI seulement (nécessite une release GitHub publique, sinon voir ADA_CODE)
#    curl -fsSL https://ada.byarms.com/install.sh | bash
#
#    # Avec un code d'achat (repo GitHub privé → seul chemin qui fonctionne)
#    ADA_CODE=XXXX-XXXX-XXXX-XXXX curl -fsSL https://ada.byarms.com/install.sh | bash
#
#    # CLI + ada-api + ada-ui (recommandé)
#    ADA_CODE=XXXX-XXXX-XXXX-XXXX curl -fsSL https://ada.byarms.com/install.sh | bash -s -- --with-server
#
#  Ce script :
#    1. Vérifie les prérequis (Node 22+, curl, unzip)
#    2. Télécharge l'archive — via ADA_CODE (code d'achat) si fourni,
#       sinon tente la dernière release GitHub publique
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
# ADA_CODE : code d'achat à usage unique (cf. ada-web /api/download/redeem).
# Si défini, il remplace entièrement le flux GitHub releases.
ADA_CODE="${ADA_CODE:-}"
INSTALL_PREFIX="${ADA_INSTALL_PREFIX:-$HOME/.ada}"

# ─── Couleurs ────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; CYAN=''; BOLD=''; DIM=''; NC=''
fi

## Toujours sur stderr (>&2) : ces helpers sont appelés depuis des fonctions
## dont le stdout est capturé via $(...) (get_download_url, download_and_extract,
## redeem_code_for_download_url) — un message sur stdout corromprait la valeur
## retournée (bug latent avant ce correctif : jamais exercé car le seul chemin
## qui fonctionnait ne loggait rien avant son `echo` final).
log_step()  { echo -e "${CYAN}→${NC} $*" >&2; }
log_ok()    { echo -e "${GREEN}✓${NC} $*" >&2; }
log_warn()  { echo -e "${YELLOW}⚠${NC} $*" >&2; }
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
    echo
    echo "Env vars:"
    echo "  ADA_CODE             Code d'achat à usage unique (XXXX-XXXX-XXXX-XXXX)."
    echo "                       Requis si la release GitHub n'est pas publique."
    echo "  ADA_BASE_URL         Override de l'URL de base (défaut: https://ada.byarms.com)"
    echo "  ADA_INSTALL_PREFIX   Override du préfixe d'installation (défaut: \$HOME/.ada)"
    echo
    echo "Exemple avec code d'achat :"
    echo "  ADA_CODE=XXXX-XXXX-XXXX-XXXX curl -fsSL https://ada.byarms.com/install.sh | bash -s -- --with-server"
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

# Échange un code d'achat à usage unique contre une URL de téléchargement.
# Flux : POST /api/download/redeem {code} → downloadToken → /api/download/file?token=...
# N'importe quel échec (code invalide/déjà utilisé/erreur réseau) est fatal :
# on ne retombe JAMAIS silencieusement sur un autre chemin.
redeem_code_for_download_url() {
  local CODE="$1"
  local URL="${ADA_BASE_URL}/api/download/redeem"

  # Échappement minimal pour rester dans un JSON valide (le format de code est
  # borné à un alphabet restreint côté serveur, mais on n'assume rien ici).
  local ESCAPED
  ESCAPED=$(printf '%s' "$CODE" | sed 's/\\/\\\\/g; s/"/\\"/g')

  log_step "Validation du code d'achat..."

  local RAW
  if ! RAW=$(curl -sS --connect-timeout 10 --max-time 30 \
        -H 'Content-Type: application/json' \
        -d "{\"code\":\"${ESCAPED}\"}" \
        -w '\n%{http_code}' \
        "$URL" 2>&1); then
    log_error "Impossible de contacter le serveur de validation (${URL})."
    exit 1
  fi

  local HTTP_CODE BODY
  HTTP_CODE=$(echo "$RAW" | tail -n1)
  BODY=$(echo "$RAW" | sed '$d')

  if ! echo "$BODY" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
    local ERR_MSG
    ERR_MSG=$(echo "$BODY" | sed -n 's/.*"error"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
    log_error "Code refusé : ${ERR_MSG:-réponse inattendue du serveur (HTTP ${HTTP_CODE})}"
    exit 1
  fi

  local TOKEN
  TOKEN=$(echo "$BODY" | sed -n 's/.*"downloadToken"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  if [ -z "$TOKEN" ]; then
    log_error "Réponse du serveur invalide (downloadToken manquant, HTTP ${HTTP_CODE})."
    exit 1
  fi

  log_ok "Code validé"
  echo "${ADA_BASE_URL}/api/download/file?token=${TOKEN}"
}

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

  # Pas de fallback silencieux : le repo GitHub est privé, cette voie échoue
  # systématiquement dans ce cas. On échoue fort avec une remédiation claire.
  log_error "Téléchargement direct indisponible : impossible de récupérer une release GitHub publique (${GITHUB_REPO})."
  echo "  Deux options :" >&2
  echo "   1. Rendre la release GitHub publique et accessible en anonyme." >&2
  echo "   2. Fournir un code d'achat via la variable ADA_CODE :" >&2
  echo "        ADA_CODE=XXXX-XXXX-XXXX-XXXX curl -fsSL ${ADA_BASE_URL}/install.sh | bash" >&2
  exit 1
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
  if [ -n "$ADA_CODE" ]; then
    DOWNLOAD_URL=$(redeem_code_for_download_url "$ADA_CODE")
  else
    DOWNLOAD_URL=$(get_download_url)
  fi

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
