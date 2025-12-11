## 1. Update System Prompt

- [x] 1.1 Add professional-to-calendar mapping table to `system_prompt_donna.md`
- [x] 1.2 Add scheduling flow instructions (verify → offer → confirm → create)
- [x] 1.3 Add result verification rules (check for event ID, handle errors)
- [x] 1.4 Add event format rules (Summary, Description patterns)

## 2. Modify n8n Workflow

- [x] 2.1 Remove "Agendador" node from `n8n/workflow_donna_agendamento.json`
- [x] 2.2 Remove "DeepSeek Agendador" LLM node
- [x] 2.3 Remove "Consultar Servicos" node (duplicate of Consultar Servicos e Precos)
- [x] 2.4 Reconnect "Ver Disponibilidade" tool to "Atendente2" (ai_tool connection)
- [x] 2.5 Reconnect "Criar Agendamento" tool to "Atendente2" (ai_tool connection)
- [x] 2.6 Remove old connections (Agendador → Atendente2, DeepSeek → Agendador, tools → Agendador)

## 3. Cleanup

- [x] 3.1 Archive `prompts/agendador_prompt.txt` to `prompts/archived/`
- [x] 3.2 Update `CLAUDE.md` architecture section

## 4. Test and Validate

- [ ] 4.1 Test availability check (Donna calls Ver Disponibilidade directly)
- [ ] 4.2 Test appointment creation (Donna calls Criar Agendamento directly)
- [ ] 4.3 Test full flow: client requests → Donna verifies → client confirms → Donna creates → verify result
- [ ] 4.4 Test error handling (unavailable slot, API error)

## Dependencies

- Section 1 and Section 2 can be done in parallel
- Section 3 depends on Section 2 completion
- Section 4 requires all previous sections complete
