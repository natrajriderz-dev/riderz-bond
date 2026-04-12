#!/bin/bash
# =============================================================
# Suyavaraa App — Efficient Dev Workflow using Aider + CrewAI
# Usage:
#   ./scripts/dev.sh aider "<task>" <file1> [file2] ...
#   ./scripts/dev.sh crew  "<task>" <file>
#   ./scripts/dev.sh full  "<task>" <file>
#   ./scripts/dev.sh review <file>
# =============================================================

set -e
export $(grep -v '^#' "$(dirname "$0")/../.env" | xargs) 2>/dev/null || true

COMMAND=$1
TASK=$2
shift 2
FILES="$@"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ── COLORS ──────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

header() { echo -e "\n${CYAN}══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}══════════════════════════════════════════${NC}\n"; }

# ── VALIDATE ────────────────────────────────────────────────
if [ -z "$DEEPSEEK_API_KEY" ]; then
  echo "❌ DEEPSEEK_API_KEY not set. Check .env file."; exit 1
fi
if [ -z "$TASK" ]; then
  echo "❌ No task provided."; echo "Usage: ./scripts/dev.sh [aider|crew|full|review] \"<task>\" <files>"; exit 1
fi

# ── AIDER MODE ──────────────────────────────────────────────
if [ "$COMMAND" = "aider" ]; then
  header "🤖 AIDER — DeepSeek Coding"
  echo -e "${YELLOW}Task:${NC} $TASK"
  echo -e "${YELLOW}Files:${NC} $FILES\n"

  aider \
    --model deepseek/deepseek-chat \
    --api-key deepseek=$DEEPSEEK_API_KEY \
    --yes-always \
    --no-auto-commits \
    --message "$TASK" \
    $FILES

  echo -e "\n${GREEN}✅ Aider done. Review changes then commit.${NC}"

# ── CREWAI REVIEW MODE ──────────────────────────────────────
elif [ "$COMMAND" = "review" ]; then
  header "🧪 CREWAI — Code Review & Bug Hunt"
  echo -e "${YELLOW}File:${NC} $FILES\n"

  cd "$APP_DIR"
  python3 -c "
import os, sys
sys.path.insert(0, 'crewai-automation')
os.chdir('$APP_DIR')
from dev_test_crew import create_testing_crew
crew = create_testing_crew('$FILES')
result = crew.kickoff()
print('\n=== REVIEW RESULT ===')
print(result)
"

# ── CREWAI FEATURE MODE ─────────────────────────────────────
elif [ "$COMMAND" = "crew" ]; then
  header "🤖 CREWAI — Feature Development"
  echo -e "${YELLOW}Task:${NC} $TASK"
  echo -e "${YELLOW}File:${NC} $FILES\n"

  cd "$APP_DIR"
  python3 -c "
import os, sys
sys.path.insert(0, 'crewai-automation')
os.chdir('$APP_DIR')
from dev_test_crew import create_feature_development_crew
crew = create_feature_development_crew('$TASK', '$FILES')
result = crew.kickoff()
print('\n=== CREW RESULT ===')
print(result)
"

# ── FULL AUTOMATION MODE ────────────────────────────────────
elif [ "$COMMAND" = "full" ]; then
  header "🚀 FULL — Aider codes, CrewAI reviews & tests"
  echo -e "${YELLOW}Task:${NC} $TASK"
  echo -e "${YELLOW}File:${NC} $FILES\n"

  # Step 1: Aider implements
  header "STEP 1/2 — Aider implements the feature"
  aider \
    --model deepseek/deepseek-chat \
    --api-key deepseek=$DEEPSEEK_API_KEY \
    --yes-always \
    --no-auto-commits \
    --message "$TASK" \
    $FILES

  # Step 2: CrewAI reviews
  header "STEP 2/2 — CrewAI reviews & finds bugs"
  cd "$APP_DIR"
  python3 -c "
import os, sys
sys.path.insert(0, 'crewai-automation')
os.chdir('$APP_DIR')
from dev_test_crew import create_testing_crew
crew = create_testing_crew('$FILES')
result = crew.kickoff()
print('\n=== REVIEW RESULT ===')
print(result)
"
  echo -e "\n${GREEN}✅ Full automation done! Review output above.${NC}"

else
  echo "❌ Unknown command: $COMMAND"
  echo ""
  echo "Commands:"
  echo "  aider  \"<task>\" <files>   — Aider codes with DeepSeek"
  echo "  crew   \"<task>\" <file>    — CrewAI implements feature"
  echo "  review <file>             — CrewAI reviews & finds bugs"
  echo "  full   \"<task>\" <file>    — Aider codes + CrewAI reviews"
  exit 1
fi
