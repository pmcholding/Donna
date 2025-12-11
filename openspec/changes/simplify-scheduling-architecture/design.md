# Design: Simplify Scheduling Architecture

## Context

The Donna WhatsApp agent uses n8n workflows with LangChain nodes. The current architecture has a sub-agent (Agendador) that handles scheduling, but this creates a communication gap where the sub-agent cannot interact directly with clients.

### Current Architecture (Problematic)
```
Client → WhatsApp → n8n Workflow
                       ↓
                   Donna (Atendente2)
                   ├── DeepSeek LLM
                   ├── FAQs (Supabase)
                   ├── Consultar Servicos e Precos (Sheets)
                   └── Agendador (AI Agent Tool) ← SUB-AGENT
                       ├── DeepSeek Agendador LLM
                       ├── Consultar Servicos (Sheets)
                       ├── Ver Disponibilidade (Calendar)
                       └── Criar Agendamento (Calendar)
```

### Proposed Architecture (Simplified)
```
Client → WhatsApp → n8n Workflow
                       ↓
                   Donna (Atendente2)
                   ├── DeepSeek LLM
                   ├── FAQs (Supabase)
                   ├── Consultar Servicos e Precos (Sheets)
                   ├── Ver Disponibilidade (Calendar) ← DIRECT
                   └── Criar Agendamento (Calendar) ← DIRECT
```

## Goals / Non-Goals

### Goals
- Eliminate sub-agent communication gap
- Reduce LLM calls from 2 to 1 per scheduling interaction
- Give Donna full conversation context for scheduling decisions
- Add explicit result verification rules

### Non-Goals
- Change Google Calendar/Sheets integration
- Modify credential configuration
- Change business rules (evaluation services, no prices, etc.)

## Decisions

### Decision 1: Direct Tool Connection
Connect Calendar tools directly to Donna instead of through sub-agent.

**Rationale**: Donna already has tools connected (FAQs, Consultar Precos). Adding 2 more follows the same pattern. No architectural change needed.

**Alternatives considered**:
- Fix sub-agent prompt: Still has stateless problem, doesn't solve root cause
- Add confirmation loop: Complex, adds more failure points

### Decision 2: Merge Prompts
Move scheduling rules from `agendador_prompt.txt` into `system_prompt_donna.md`.

**Rationale**: Single source of truth, easier maintenance. DeepSeek handles larger prompts well.

### Decision 3: Add Result Verification
Add explicit rules for Donna to verify Calendar API responses before confirming to client.

**Rationale**: Prevents false confirmations. Clear success/failure criteria.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Larger system prompt | DeepSeek handles well; organize in clear sections |
| More tools on Donna | n8n AI Agent supports many tools; no limit issue |
| Testing coverage | Test same scenarios as before |

## Migration Plan

1. Update `system_prompt_donna.md` with scheduling rules
2. Modify `n8n/workflow_donna_agendamento.json`:
   - Remove nodes: Agendador, DeepSeek Agendador, Consultar Servicos (duplicate)
   - Reconnect: Ver Disponibilidade → Atendente2, Criar Agendamento → Atendente2
3. Archive `prompts/agendador_prompt.txt`
4. Update `CLAUDE.md` documentation
5. Test full scheduling flow

**Rollback**: Restore previous workflow JSON from git if issues found.

## Open Questions

None - architecture is straightforward and follows existing patterns.
