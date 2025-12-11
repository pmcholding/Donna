# Change: Simplify Scheduling Architecture - Remove Sub-Agent

## Why

The current sub-agent architecture (Agendador) has a critical flaw: it asks for client confirmation but cannot receive the response. In a real case, the Agendador verified availability, requested confirmation, but never called "Criar Agendamento" - leaving the client with a false confirmation. The sub-agent adds complexity, cost (2x LLM calls), and latency without clear benefit.

## What Changes

- **BREAKING**: Remove Agendador sub-agent from workflow
- Remove DeepSeek Agendador LLM node (eliminates duplicate LLM call)
- Connect "Ver Disponibilidade" and "Criar Agendamento" tools directly to Donna (Atendente2)
- Update system prompt with scheduling rules, professional-to-calendar mapping, and result verification
- Archive `prompts/agendador_prompt.txt`

## Impact

- Affected specs: `scheduling` (modified capability)
- Affected code:
  - `n8n/workflow_donna_agendamento.json` (remove 3 nodes, reconnect 2 tools)
  - `system_prompt_donna.md` (add calendar mapping, verification rules)
  - `prompts/agendador_prompt.txt` (archive/delete)
  - `CLAUDE.md` (update architecture documentation)

## Benefits

| Metric | Before | After |
|--------|--------|-------|
| LLM calls per scheduling | 2 | 1 |
| Points of failure | 3 (Donna → Agendador → Tools) | 1 (Donna → Tools) |
| Context available | Partial (sub-agent stateless) | Full conversation |
| Latency | Higher | Lower |
| Cost per interaction | 2x DeepSeek | 1x DeepSeek |

## Root Cause Analysis

The bug occurred because:
1. Agendador prompt said "always confirm before creating"
2. Agendador is stateless - cannot receive confirmation
3. Agendador returned "waiting for confirmation" instead of creating
4. Donna interpreted response as success and confirmed to client
5. No event was created in Google Calendar
