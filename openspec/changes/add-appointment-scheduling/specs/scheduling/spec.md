## ADDED Requirements

### Requirement: Service Query

The system SHALL query available services and their durations from Google Sheets based on the selected professional.

#### Scenario: Query services for a professional
- **WHEN** client asks about a service
- **AND** a professional is specified or selected
- **THEN** the system queries the professional's sheet tab
- **AND** returns the service name and duration in minutes

#### Scenario: Service not found
- **WHEN** client requests a service not offered by the selected professional
- **THEN** the system informs the client the service is not available with that professional
- **AND** suggests checking with another professional

### Requirement: Availability Check

The system SHALL check professional availability by querying their Google Calendar for existing events.

#### Scenario: Check availability for next 7 days
- **WHEN** client wants to schedule an appointment
- **AND** professional and service are selected
- **THEN** the system queries the professional's calendar for the next 7 days
- **AND** calculates available time slots based on service duration
- **AND** filters slots within operating hours (Mon-Sat 08:00-20:00, Sun 09:00-20:00)
- **AND** presents up to 5 available options to the client

#### Scenario: No availability found
- **WHEN** professional has no available slots in the next 7 days
- **THEN** the system informs the client
- **AND** offers to check a different professional or extended timeframe

### Requirement: Appointment Creation

The system SHALL create appointments in Google Calendar with complete client and service information.

#### Scenario: Successful booking
- **WHEN** client selects an available time slot
- **AND** client name and phone are known
- **THEN** the system creates a calendar event with:
  - Summary: "Donna - [Service] - [Client Name]"
  - Description: Client name, phone, service details
  - Start/End times based on service duration
- **AND** confirms the booking to the client

#### Scenario: Slot became unavailable
- **WHEN** client selects a time slot
- **AND** the slot was booked by another client in the meantime
- **THEN** the system detects the conflict
- **AND** offers alternative available slots

### Requirement: Professional Selection

The system SHALL allow clients to choose their preferred professional from available options.

#### Scenario: Client selects professional
- **WHEN** client mentions a service
- **THEN** the system asks which professional they prefer
- **AND** lists professionals who offer that service

#### Scenario: Client has no preference
- **WHEN** client has no professional preference
- **THEN** the system shows available slots across all relevant professionals
- **AND** indicates which professional each slot is with

### Requirement: Evaluation Services

The system SHALL flag services that require prior evaluation before final booking.

#### Scenario: Service requires evaluation
- **WHEN** client requests micropigmentation, straightening, or highlights
- **THEN** the system informs that an evaluation appointment is needed first
- **AND** offers to schedule the evaluation instead

#### Scenario: Regular service booking
- **WHEN** client requests a service not requiring evaluation
- **THEN** the system proceeds with normal booking flow

### Requirement: Price Confidentiality

The system SHALL NOT expose service prices to clients under any circumstances.

#### Scenario: Client asks for price
- **WHEN** client asks how much a service costs
- **THEN** the system responds that prices are discussed at the salon
- **AND** offers to schedule an appointment to discuss in person

#### Scenario: Price in sheets is ignored
- **WHEN** the system queries Google Sheets
- **THEN** the system reads only service name and duration
- **AND** never includes the price column in responses
