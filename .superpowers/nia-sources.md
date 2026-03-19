# Nia Sources - MatricMaster AI

## Local Indexed Sources

### This Repository
- **Path**: `C:\Users\Themba\Documents\org1128\projects\matricmaster-ai`
- **Indexed**: Yes (basic structure)
- **Tools**: Use glob/grep/read for navigation
- **Last Updated**: 2026-03-19

### Key Directories to Search
- `src/components/` - All React components
- `src/services/` - Business logic services
- `src/stores/` - Zustand state stores
- `src/lib/db/` - Database schemas and actions
- `src/app/` - Next.js App Router pages
- `src/hooks/` - Custom React hooks

### Search Tips
- Component files: `glob("src/components/**/*.tsx")`
- Service files: `glob("src/services/**/*.ts")`
- Database actions: `grep("export async function")` in `src/lib/db/`
- Store files: `grep("create<")` in `src/stores/`

## How to Use This File

In future sessions:
1. Start by checking this file for pre-indexed sources
2. Use `glob` and `grep` to find specific files
3. Use `read` for detailed context
4. Add new sources you discover here

## Style Guides Indexed
- `AGENTS.md` - Project conventions (Bun, typography, shadcn/ui)
- `.config/opencode/skills/matricmaster-style/SKILL.md` - Full style guide
- `biome.json` - Code formatting rules
