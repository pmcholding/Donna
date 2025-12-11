## 1. Create n8n Workflow

- [x] 1.1 Create `n8n/workflow_donna_agendamento.json` with base structure
- [x] 1.2 Add AI Agent Tool node "Agendador" with system prompt
- [x] 1.3 Add LLM node for Agendador sub-agent
- [x] 1.4 Add Google Sheets Tool with `$fromAI('Profissional')` for sheet selection
- [x] 1.5 Add Google Calendar Tool (Get Events) for availability check
- [x] 1.6 Add Google Calendar Tool (Create Event) for booking
- [x] 1.7 Connect all tools to Agendador sub-agent
- [x] 1.8 Connect Agendador to main Atendente2 agent

## 2. Update System Prompt

- [x] 2.1 Create updated `system_prompt_donna.md` with scheduling instructions
- [x] 2.2 Add professional mapping (names, specialties)
- [x] 2.3 Add scheduling conversation flow guidelines
- [x] 2.4 Add business rules (no prices, evaluation services, operating hours)
- [x] 2.5 Add Agendador sub-agent system prompt

## 3. Test and Validate

- [ ] 3.1 Test Google Sheets query by professional
- [ ] 3.2 Test Google Calendar availability check
- [ ] 3.3 Test Google Calendar event creation
- [ ] 3.4 Test full conversation flow (service → professional → time → confirm)
- [ ] 3.5 Test edge cases (no availability, wrong service, invalid date)

## Dependencies

- Tasks in section 1 can be done in parallel
- Section 2 can be done in parallel with section 1
- Section 3 requires sections 1 and 2 complete
