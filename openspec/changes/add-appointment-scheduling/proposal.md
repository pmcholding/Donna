# Change: Add Appointment Scheduling System

## Why

Donna currently answers questions and provides information about services, but cannot schedule appointments. Clients must call or visit to book, creating friction and losing potential bookings outside business hours. Adding scheduling capability allows 24/7 automated booking directly through WhatsApp.

## What Changes

- Add sub-agent "Agendador" as AI Agent Tool for specialized scheduling logic
- Integrate Google Sheets Tool to query services, professionals, and durations
- Integrate Google Calendar Tool to check availability and create events
- Update system prompt with scheduling flow and professional mapping
- **BREAKING**: None - purely additive functionality

## Impact

- Affected specs: `scheduling` (new capability)
- Affected code:
  - `n8n/workflow_donna_agendamento.json` (new workflow)
  - `system_prompt_donna.md` (updated prompt)
- External dependencies:
  - Google Sheets API (existing credentials: `Google Sheets account`)
  - Google Calendar API (existing credentials: `Google Calendar - Donna`)
  - Spreadsheet: `1y6TijGRsulD2TZB-HtYmPawaR9doXvxKxXZ1JesuBL8`

## Business Rules

1. NEVER expose prices to clients (existing rule maintained)
2. Services requiring evaluation (micropigmentation, straightening, highlights) must be flagged
3. Client always chooses the professional
4. Operating hours: Mon-Sat 08:00-20:00, Sun/Holidays 09:00-20:00
5. Calendar names match sheet tab names (e.g., "1 Maikel", "2 Vanessa")
