## Context

Donna is a WhatsApp AI assistant for a beauty salon in Balneário Camboriú, Brazil. Currently handles FAQ via RAG but cannot book appointments. The salon uses Google Sheets to manage services/prices per professional and Google Calendar for each professional's schedule.

### Stakeholders
- Salon clients (booking via WhatsApp)
- Salon staff (receiving calendar events)
- Salon management (no price exposure rule)

### Constraints
- Must work within n8n workflow automation platform
- Must use existing Google OAuth credentials
- Must not expose service prices
- Must support 12 professionals with individual calendars

## Goals / Non-Goals

### Goals
- Enable appointment booking via WhatsApp conversation
- Query services and durations from Google Sheets
- Check availability and create events in Google Calendar
- Maintain natural conversational flow with Donna

### Non-Goals
- Payment processing
- Appointment cancellation/rescheduling (future scope)
- SMS/email confirmations (future scope)
- Multi-location support

## Decisions

### Decision 1: Sub-Agent Architecture (AI Agent Tool)

**What**: Use n8n's `agentTool` to create a specialized "Agendador" sub-agent with its own tools and prompt.

**Why**:
- Separates scheduling logic from general conversation
- Reduces token usage (scheduling context only loaded when needed)
- Easier to maintain and debug
- Follows n8n's recommended "Multi-Agent with Gatekeeper" pattern

**Alternatives considered**:
- Direct tools on main agent: Simpler but bloats main agent context
- Separate workflow via Call n8n Workflow: More overhead, less natural conversation flow

### Decision 2: Native n8n Tools ($fromAI)

**What**: Use `googleSheetsTool` and `googleCalendarTool` with `$fromAI()` for dynamic parameters.

**Why**:
- Native tools handle auth, pagination, errors
- `$fromAI()` lets LLM determine parameters naturally
- No custom code needed for API calls

### Decision 3: Unified Naming (Sheet = Calendar)

**What**: Professional names are identical in Sheets tabs and Calendar names.

**Why**:
- Simplifies agent logic (one variable for both lookups)
- Reduces chance of mismatches
- Example: "1 Maikel" is both the sheet tab and calendar name

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        n8n Workflow                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌──────────────────────────────────────┐   │
│  │   Webhook   │───▶│         Atendente2 (Main Agent)      │   │
│  │  WhatsApp   │    │  - DeepSeek LLM                      │   │
│  └─────────────┘    │  - Postgres Memory                   │   │
│                     │  - Tools:                            │   │
│                     │    ├── faqs_donna (RAG)              │   │
│                     │    └── Agendador (Sub-Agent) ────────┼───┼─┐
│                     └──────────────────────────────────────┘   │ │
│                                                                 │ │
│  ┌──────────────────────────────────────────────────────────┐  │ │
│  │              Agendador (AI Agent Tool)                   │◀─┘ │
│  │  - Specialized LLM for scheduling                       │    │
│  │  - System prompt with professional mapping              │    │
│  │  - Tools:                                               │    │
│  │    ├── Google Sheets Tool (services/durations)          │    │
│  │    ├── Google Calendar - Get Events (availability)      │    │
│  │    └── Google Calendar - Create Event (booking)         │    │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. Client: "Quero agendar mechas com o Maikel"
   │
2. Donna (main agent): Detects scheduling intent
   │
3. Donna → Agendador: {service: "mechas", professional: "1 Maikel", client: "Maria", phone: "+55..."}
   │
4. Agendador → Google Sheets: Query "1 Maikel" tab for "mechas" duration
   │                          Returns: 120 minutes
   │
5. Agendador → Google Calendar: Get events from "1 Maikel" calendar (next 7 days)
   │                            Returns: Existing appointments
   │
6. Agendador: Calculates available 2-hour slots within operating hours
   │
7. Agendador → Donna: "Available: Dec 15 10:00, Dec 15 14:00, Dec 16 09:00"
   │
8. Donna: "Tenho disponibilidade dia 15 às 10h ou 14h, ou dia 16 às 9h. Qual prefere?"
   │
9. Client: "Dia 15 às 10h"
   │
10. Donna → Agendador: Create booking for Dec 15 10:00-12:00
    │
11. Agendador → Google Calendar: Create event
    │   Summary: "Donna - Mechas - Maria"
    │   Description: "Cliente: Maria\nTelefone: +55...\nServiço: Mechas"
    │
12. Donna: "Pronto! Seu horário está confirmado para dia 15/12 às 10h com Maikel."
```

## Professional Mapping

| Sheet Tab / Calendar | Specialty |
|---------------------|-----------|
| 1 Maikel | Hair (highlights, straightening, cuts) |
| 2 Vanessa | Makeup, Micropigmentation, Brows |
| 3 Sandy | General |
| 4 Andréa | General |
| 5 Manicure | Nails |
| 6 Auxiliar | Assistant |
| 7 Auxiliar | Assistant |
| 8 Auxiliar | Assistant |
| 9 Penteadista | Hairstyling |
| 10 Extensionista | Lashes |
| 11 Maquiadora | Makeup |
| 12 Maquiadora | Makeup |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| LLM miscalculates time slots | Include explicit slot calculation logic in sub-agent prompt |
| Calendar API rate limits | n8n handles retries; unlikely with salon volume |
| Overlapping bookings | Check availability immediately before creating event |
| Wrong professional selected | Always confirm with client before booking |

## Open Questions

1. Should auxiliaries (6, 7, 8) be exposed to clients or only internal?
2. Buffer time between appointments needed?
3. Maximum advance booking window (7 days? 30 days?)
