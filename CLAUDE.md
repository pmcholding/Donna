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
└── n8n/
    └── workflow_donna_agendamento.json  # Workflow n8n com agente
```

## Arquitetura do Agente

### Agente Donna (Atendente)
- LLM: DeepSeek
- Ferramentas:
  - **Consultar Servicos e Precos**: Google Sheets para precos e duracao
  - **Ver Disponibilidade**: Google Calendar para consultar horarios
  - **Criar Agendamento**: Google Calendar para criar eventos
  - **Calcular Data**: Converte expressoes de data para formato ISO
  - **Think**: Ferramenta de raciocinio interno para validacao

## Estrutura de Dados (Google Sheets)

A planilha `Servicos_DONNA-Sparkz` possui duas abas:

### Aba "Serviços"
| Coluna | Descricao |
|--------|-----------|
| Profissionais | Lista de nomes separados por virgula |
| Funcao | Especialidade (Cabeleireiro, Manicure, etc) |
| Servico | Nome do servico |
| Duracao_Minutos | Tempo em minutos |
| Preco_Dinheiro | Valor para pagamento em DINHEIRO (menor - incentivo) |
| Preco_Pix_Debito_Credito | Valor para Pix/Debito/Credito 1x |
| Parcela_2x | Valor da PARCELA em 2x (ja calculado) |
| Parcela_3x | Valor da PARCELA em 3x (ja calculado) |
| Parcela_4x | Valor da PARCELA em 4x (ja calculado) |
| Parcela_5x | Valor da PARCELA em 5x (ja calculado) |
| Requer_Avaliacao | Sim/Nao |
| Preco_valido_ate | Data de validade dos precos |

### Aba "Profissionais" (injetada via `{{PROFISSIONAIS_DINAMICOS}}`)
| Profissional | Especialidade | Email Calendario |
|--------------|---------------|------------------|
| Maikel | Cabeleireiro(a) | maikelcabeleireirodonna@gmail.com |
| Tatiane | Cabeleireiro(a) | donnamanicurepamela@gmail.com |
| Daniela | Cabeleireiro(a) | fofao1001@gmail.com |
| Emy | Cabeleireiro(a) | dayarquitetabc@gmail.com |
| Cintia | Cabeleireiro(a) | maikelkurtzbackup103@gmail.com |
| Vanessa | Maquiadora/Micropig/Designer Sobrancelhas | vanessamaquiadoradonna@gmail.com |
| Iohana | Maquiadora | edneiamanicuredonna@gmail.com |
| Cristiane | Maquiadora | marcelapersonalbc@gmail.com |
| Sandy | Manicure e Nail Designer | donnamanicuresandy@gmail.com |
| Carol | Manicure e Nail Designer | sophiasophiavalentinaduarte@gmail.com |
| Jianine | Manicure e Nail Designer | deboramanicuredonna@gmail.com |
| Gabi | Lash Designer | maikelkurtzbackup102@gmail.com |
| Bruna | Penteadista | cartomantemarketing@gmail.com |

## Regras de Negocio Importantes

1. **Precos**: Sempre usar "a partir de R$" - nunca valor exato
2. **Lista de servicos**: Nunca fornecer lista completa - pedir para cliente especificar
3. **Preferencia de profissional**: Sempre perguntar antes de verificar disponibilidade
4. **Horario indisponivel**: Oferecer horario proximo, depois outro profissional
5. **Servicos com avaliacao**: Micropigmentacao, Alisamento e Mechas exigem avaliacao previa
6. **Verificacao de agendamento**: SEMPRE verificar se a resposta do Calendar contem ID do evento antes de confirmar ao cliente
7. **Emails de calendario**: NUNCA expor emails ao cliente - sao dados internos para uso das ferramentas