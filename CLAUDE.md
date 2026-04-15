# Instructions Claude Code - BetAnalytic
# CLAUDE.MD - TOKEN-SAVER MODE ⚠️

## ⚡ MCP TOOLING (STRICT)
- **Priority:** ALWAYS use `token-savior` (find_symbol, get_function_source, get_dependencies, get_change_impact).
- **Fallback:** Use `grep`/`read` ONLY if MCP fails.
- **Rule:** No tool explanations. Call tool immediately.

## 🤐 OUTPUT CONTROL (ZERO-YAP)
- **Format:** Code-only or Direct Answer. 
- **Banned:** Greetings, "I will...", "Here is...", status updates, repeating requests, apologies.
- **Conciseness:** Use `sed` style for small edits. Don't rewrite entire files.
- **Session:** Suggest `/clear` or `/compact` after every task completion.

## 🛠 TECH STACK (MINIMAL)
- **Core:** T3 Stack (Next.js 15, tRPC v11, Prisma, Tailwind v4).
- **UI:** shadcn/ui + Radix + `cn()` util. 
- **Design:** Use tokens `bg-bg-primary`, `bg-accent-cyan`, `text-text-primary`, `bg-agent-scout`.
- **Quality:** TypeScript Strict, `pnpm lint`, 44x44px touch targets.

## 📂 STRUCTURE
- `src/components/ui/` (Global) | `src/components/features/` (Specific).
- **Workflow:** Plan first (briefly) -> MCP search -> Edit -> Lint -> Done.