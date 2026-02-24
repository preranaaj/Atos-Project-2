# Implementation Plan: Healthcare Ecosystem (Patient, Doctor, Admin)

We will transform Auralis from a doctor-focused tool into a comprehensive healthcare management system supporting three user roles: **Patients**, **Doctors**, and **Administrators**, with features inspired by the reference project.

## Phase 14: Multi-Role Authentication & Foundation

### [Backend]
- [MODIFY] `main.py`:
  - Update `UserCreate` to include an optional `role` (default: 'Patient').
  - Ensure `login` and `register` handle and return the user's `role`.
  - Seed a default **Administrator** account: `admin@auralis.com` / `admin123`.

### [Frontend]
- [MODIFY] `AuthContext.jsx`:
  - Update `register` to accept `role`.
  - Implement role-based redirection after login/registration:
    - Admin -> `/admin`
    - Doctor -> `/dashboard`
    - Patient -> `/portal`
- [MODIFY] `Register.jsx`:
  - Add a role selection module (Patient vs Doctor).
  - Update nomenclature from "Clinical Onboarding" to generic "System Onboarding" or context-aware titles.

## Phase 15: Patient Portal (Access & Identity)

### [Frontend]
- [NEW] `PatientDashboard.jsx`:
  - Personal health summary.
  - Quick access to appointments and bills.
- [NEW] `PatientProfileForm.jsx`:
  - Redirect new patients here to fill out Age, Blood Type, Weight, Height.

## Phase 16: Clinical Vitals & Detailed Records

### [Backend]
- [NEW] `Vitals` collection or sub-document in `Patient`.
- [POST] `/patients/{patient_id}/vitals`: Record Temperature, Heart Rate, BP, Weight, Height.

### [Frontend]
- [MODIFY] `PatientDetail.jsx`:
  - Add an "Add Vitals" form for Doctors.
  - Update charts to pull from real vitals history stored in MongoDB.

## Phase 17: Appointment Management System

### [Backend]
- [NEW] `Appointments` collection.
- Endpoints:
  - `POST /appointments`: Patient books an appointment.
  - `GET /appointments`: List appointments (filtered by doctor or patient).
  - `PUT /appointments/{id}`: Approve or Cancel with reason.

### [Frontend]
- [NEW] `BookAppointment.jsx`: Patient choosing service, physician, and time.
- [MODIFY] `Schedule.jsx`: Update for Doctors to manage and approve pending requests.

## Phase 18: Administrative Command Center

### [Frontend]
- [NEW] `AdminDashboard.jsx`:
  - System-wide stats (total users, active appointments, revenue).
  - User management (Edit/Remove any doctor or patient).
- [NEW] `ServiceManagement.jsx`: Admin adding hospital services and pricing.

## Phase 19: Clinical Billing & Reviews

### [Backend]
- [NEW] `Bills` collection.
- [NEW] `Reviews` collection.

### [Frontend]
- [NEW] `PatientBilling.jsx`: View and pay medical bills.
- [NEW] `DoctorReviews.jsx`: Patients rating their physicians.
