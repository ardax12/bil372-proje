const API_BASE = 'http://localhost:5000/api';

export const api = {
  // Flights
  getFlights: () => fetch(`${API_BASE}/flights`).then(res => res.json()),
  getFlight: (id: number) => fetch(`${API_BASE}/flights/${id}`).then(res => res.json()),
  addFlight: (data: any) => fetch(`${API_BASE}/flights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updateFlight: (id: number, data: any) => fetch(`${API_BASE}/flights/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteFlight: (id: number) => fetch(`${API_BASE}/flights/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Passengers
  getPassengers: () => fetch(`${API_BASE}/passengers`).then(res => res.json()),
  getPassenger: (id: number) => fetch(`${API_BASE}/passengers/${id}`).then(res => res.json()),
  addPassenger: (data: any) => fetch(`${API_BASE}/passengers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updatePassenger: (id: number, data: any) => fetch(`${API_BASE}/passengers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deletePassenger: (id: number) => fetch(`${API_BASE}/passengers/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Aircraft
  getAircraft: () => fetch(`${API_BASE}/aircraft`).then(res => res.json()),
  addAircraft: (data: any) => fetch(`${API_BASE}/aircraft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updateAircraft: (id: number, data: any) => fetch(`${API_BASE}/aircraft/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteAircraft: (id: number) => fetch(`${API_BASE}/aircraft/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Tickets
  getTickets: () => fetch(`${API_BASE}/tickets`).then(res => res.json()),
  addTicket: (data: any) => fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteTicket: (id: number) => fetch(`${API_BASE}/tickets/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Payments
  getPayments: () => fetch(`${API_BASE}/payments`).then(res => res.json()),
  addPayment: (data: any) => fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deletePayment: (id: number) => fetch(`${API_BASE}/payments/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Airports & Pilots
  getAirports: () => fetch(`${API_BASE}/airports`).then(res => res.json()),
  getPilots: () => fetch(`${API_BASE}/pilots`).then(res => res.json()),

  // Stats
  getStats: () => fetch(`${API_BASE}/stats`).then(res => res.json()),

  // Reservations
  getReservations: () => fetch(`${API_BASE}/reservations`).then(res => res.json()),
};
