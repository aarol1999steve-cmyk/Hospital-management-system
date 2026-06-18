export type UserRole = 'admin' | 'doctor' | 'receptionist';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type PaymentMethod = 'cash' | 'credit_card' | 'upi' | 'insurance';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type NotificationType = 'appointment' | 'billing' | 'system' | 'medical';
export type Gender = 'male' | 'female' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  profile_id: string;
  department_id?: string;
  specialization: string;
  qualification?: string;
  experience_years: number;
  consultation_fee: number;
  available_days: string[];
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  department?: Department;
}

export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  blood_group?: string;
  phone: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  allergies?: string[];
  current_medications?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  department_id?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason_for_visit?: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
  department?: Department;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis?: string;
  symptoms?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface Prescription {
  id: string;
  medical_record_id: string;
  patient_id: string;
  doctor_id: string;
  notes?: string;
  is_dispensed: boolean;
  created_at: string;
  items?: PrescriptionItem[];
  patient?: Patient;
  doctor?: Doctor;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  appointment_id?: string;
  consultation_fee: number;
  additional_charges: number;
  discount: number;
  tax: number;
  total_amount: number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

export interface DashboardStats {
  total_patients: number;
  total_doctors: number;
  appointments_today: number;
  revenue_generated: number;
  appointments_scheduled: number;
  appointments_completed: number;
  appointments_cancelled: number;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}
