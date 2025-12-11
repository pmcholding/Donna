## MODIFIED Requirements

### Requirement: Appointment Scheduling Architecture

The scheduling system SHALL use direct tool connections from the main agent (Donna) to Google Calendar, without intermediate sub-agents.

#### Scenario: Direct availability check
- **WHEN** client requests to schedule an appointment
- **THEN** Donna SHALL call "Ver Disponibilidade" tool directly with the professional's calendar email
- **AND** Donna SHALL calculate available slots based on service duration

#### Scenario: Direct appointment creation
- **WHEN** client confirms desired time slot
- **THEN** Donna SHALL call "Criar Agendamento" tool directly
- **AND** Donna SHALL verify the response contains an event ID before confirming to client

#### Scenario: Result verification on success
- **WHEN** "Criar Agendamento" response contains 'id', 'htmlLink', or 'eventId'
- **AND** response contains event data (start, end, summary)
- **THEN** Donna SHALL confirm the appointment to the client

#### Scenario: Result verification on failure
- **WHEN** "Criar Agendamento" response contains 'error', 'Forbidden', 'denied', or 'failed'
- **OR** response does NOT contain an event ID
- **THEN** Donna SHALL inform the client of the error
- **AND** Donna SHALL suggest trying another time or professional

### Requirement: Professional Calendar Mapping

Donna SHALL use the correct Google Calendar email for each professional when checking availability or creating appointments.

#### Scenario: Calendar lookup
- **WHEN** scheduling with a specific professional
- **THEN** Donna SHALL use the mapped calendar email from the professional mapping table
- **AND** Donna SHALL NOT ask the client for calendar information

## REMOVED Requirements

### Requirement: Agendador Sub-Agent

**Reason**: Sub-agent architecture creates communication gap - cannot receive client confirmation, causes false positive confirmations.

**Migration**: Scheduling tools connected directly to Donna; scheduling rules merged into main system prompt.
