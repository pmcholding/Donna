<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Donna - Salao de Beleza e Clinica

Agente de atendimento via WhatsApp para o Donna Salao de Beleza em Balneario Camboriu.

## Estrutura do Projeto

```
/
├── system_prompt_donna.md    # Prompt principal da Donna (atendente)
├── prompts/
│   └── archived/             # Prompts arquivados
├── n8n/
│   └── workflow_donna_agendamento.json  # Workflow n8n com agente
├── data/
│   └── faqs.json             # FAQs tecnicas do salao
└── supabase/
    └── schema.sql            # Schema do banco de dados
```

## Arquitetura do Agente

### Agente Donna (Atendente)
- LLM: DeepSeek
- Ferramentas:
  - **FAQs**: Vector store (Supabase) para informacoes tecnicas
  - **Consultar Servicos e Precos**: Google Sheets para precos e duracao
  - **Ver Disponibilidade**: Google Calendar para consultar horarios
  - **Criar Agendamento**: Google Calendar para criar eventos

## Profissionais e Calendarios

| Profissional | Especialidade | Email Calendario |
|--------------|---------------|------------------|
| Maikel | Cabeleireiro | maikelcabeleireirodonna@gmail.com |
| Tatiane | Cabeleireira | donnamanicurepamela@gmail.com |
| Daniela | Cabeleireira | fofao1001@gmail.com |
| Sandy | Manicure | donnamanicuresandy@gmail.com |
| Andreia | Manicure | sophiasophiavalentinaduarte@gmail.com |
| Jianine | Manicure | deboramanicuredonna@gmail.com |
| Vanessa | Maquiadora/Micropig | vanessamaquiadoradonna@gmail.com |
| Iohana | Maquiadora | edneiamanicuredonna@gmail.com |
| Bruna | Penteadista | cartomantemarketing@gmail.com |
| Make | Maquiagem | marcelapersonalbc@gmail.com |
| Auxiliar | Auxiliar | dayarquitetabc@gmail.com |

## Regras de Negocio Importantes

1. **Precos**: Sempre usar "a partir de R$" - nunca valor exato
2. **Lista de servicos**: Nunca fornecer lista completa - pedir para cliente especificar
3. **Preferencia de profissional**: Sempre perguntar antes de verificar disponibilidade
4. **Horario indisponivel**: Oferecer horario proximo, depois outro profissional
5. **Servicos com avaliacao**: Micropigmentacao, Alisamento e Mechas exigem avaliacao previa
6. **Verificacao de agendamento**: SEMPRE verificar se a resposta do Calendar contem ID do evento antes de confirmar ao cliente