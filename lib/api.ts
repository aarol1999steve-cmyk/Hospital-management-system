import { supabase } from './supabase';
import { Patient, Doctor, Appointment, Invoice, Department, MedicalRecord, Prescription, PrescriptionItem, InvoiceItem, Notification, DashboardStats } from './types';
import { startOfDay, endOfDay, format, parse, addMinutes, setHours, setMinutes, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  const todayStart = startOfDay(today).toISOString();
  const todayEnd = endOfDay(today).toISOString();

  const [
    { count: total_patients },
    { count: total_doctors },
    { data: appointmentsToday },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('doctors').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('id').eq('appointment_date', format(today, 'yyyy-MM-dd')),
    supabase.from('invoices').select('total_amount').eq('payment_status', 'paid'),
  ]);

  const revenue_generated = revenueData?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

  return {
    total_patients: total_patients || 0,
    total_doctors: total_doctors || 0,
    appointments_today: appointmentsToday?.length || 0,
    revenue_generated,
    appointments_scheduled: 0,
    appointments_completed: 0,
    appointments_cancelled: 0,
  };
}

// Patients
export async function getPatients(search?: string): Promise<Patient[]> {
  let query = supabase
    .from('patients')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,patient_id.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createPatient(patient: Partial<Patient>): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .update({ ...patient, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase
    .from('patients')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// Doctors
export async function getDoctors(search?: string): Promise<Doctor[]> {
  let query = supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles(*),
      department:departments(*)
    `)
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`specialization.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getDoctor(id: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles(*),
      department:departments(*)
    `)
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getDoctorsByDepartment(departmentId: string): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles(*),
      department:departments(*)
    `)
    .eq('department_id', departmentId)
    .eq('is_available', true);
  if (error) throw error;
  return data || [];
}

// Departments
export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

// Appointments
export async function getAppointments(filters?: {
  patient_id?: string;
  doctor_id?: string;
  date?: string;
  status?: string;
}): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(*),
      doctor:doctors(
        *,
        profile:profiles(*),
        department:departments(*)
      ),
      department:departments(*)
    `)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (filters?.patient_id) {
    query = query.eq('patient_id', filters.patient_id);
  }
  if (filters?.doctor_id) {
    query = query.eq('doctor_id', filters.doctor_id);
  }
  if (filters?.date) {
    query = query.eq('appointment_date', filters.date);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(*),
      doctor:doctors(
        *,
        profile:profiles(*),
        department:departments(*)
      ),
      department:departments(*)
    `)
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update({ ...appointment, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAvailableTimeSlots(doctorId: string, date: string): Promise<{ start_time: string; end_time: string; is_available: boolean }[]> {
  const doctor = await getDoctor(doctorId);
  if (!doctor) return [];

  const dayOfWeek = format(parse(date, 'yyyy-MM-dd', new Date()), 'EEEE').toLowerCase();
  if (!doctor.available_days.map(d => d.toLowerCase()).includes(dayOfWeek)) {
    return [];
  }

  const startTime = parse(doctor.start_time, 'HH:mm:ss', new Date());
  const endTime = parse(doctor.end_time, 'HH:mm:ss', new Date());
  const slotDuration = 30;

  const { data: bookedSlots } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled');

  const bookedTimes = new Set(
    bookedSlots?.map(slot => `${slot.start_time}-${slot.end_time}`) || []
  );

  const slots: { start_time: string; end_time: string; is_available: boolean }[] = [];
  let currentTime = startTime;

  while (currentTime < endTime) {
    const slotEnd = addMinutes(currentTime, slotDuration);
    const timeKey = `${format(currentTime, 'HH:mm:ss')}-${format(slotEnd, 'HH:mm:ss')}`;

    slots.push({
      start_time: format(currentTime, 'HH:mm:ss'),
      end_time: format(slotEnd, 'HH:mm:ss'),
      is_available: !bookedTimes.has(timeKey),
    });

    currentTime = slotEnd;
  }

  return slots;
}

// Medical Records
export async function getMedicalRecords(patientId?: string): Promise<MedicalRecord[]> {
  let query = supabase
    .from('medical_records')
    .select(`
      *,
      patient:patients(*),
      doctor:doctors(
        *,
        profile:profiles(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createMedicalRecord(record: Partial<MedicalRecord>): Promise<MedicalRecord> {
  const { data, error } = await supabase
    .from('medical_records')
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Prescriptions
export async function getPrescriptions(patientId?: string): Promise<Prescription[]> {
  let query = supabase
    .from('prescriptions')
    .select(`
      *,
      patient:patients(*),
      doctor:doctors(
        *,
        profile:profiles(*)
      ),
      items:prescription_items(*)
    `)
    .order('created_at', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createPrescription(prescription: Partial<Prescription>, items: Partial<PrescriptionItem>[]): Promise<Prescription> {
  const { data: presc, error: prescError } = await supabase
    .from('prescriptions')
    .insert(prescription)
    .select()
    .single();
  if (prescError) throw prescError;

  if (items.length > 0) {
    const itemsWithPrescriptionId = items.map(item => ({
      ...item,
      prescription_id: presc.id,
    }));

    const { error: itemsError } = await supabase
      .from('prescription_items')
      .insert(itemsWithPrescriptionId);
    if (itemsError) throw itemsError;
  }

  return presc;
}

// Invoices
export async function getInvoices(filters?: {
  patient_id?: string;
  status?: string;
}): Promise<Invoice[]> {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      patient:patients(*),
      items:invoice_items(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.patient_id) {
    query = query.eq('patient_id', filters.patient_id);
  }
  if (filters?.status) {
    query = query.eq('payment_status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      patient:patients(*),
      items:invoice_items(*)
    `)
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createInvoice(invoice: Partial<Invoice>, items?: Partial<InvoiceItem>[]): Promise<Invoice> {
  const { data: inv, error: invError } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();
  if (invError) throw invError;

  if (items && items.length > 0) {
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: inv.id,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);
    if (itemsError) throw itemsError;
  }

  return inv;
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .update({ ...invoice, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Notifications
export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function createNotification(notification: Partial<Notification>): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Analytics
export async function getMonthlyRevenue(): Promise<{ month: string; revenue: number }[]> {
  const sixMonthsAgo = subMonths(new Date(), 6);

  const { data, error } = await supabase
    .from('invoices')
    .select('created_at, total_amount')
    .eq('payment_status', 'paid')
    .gte('created_at', sixMonthsAgo.toISOString())
    .order('created_at');

  if (error) throw error;

  const monthlyData: Record<string, number> = {};

  for (let i = 0; i < 6; i++) {
    const month = subMonths(new Date(), 5 - i);
    const key = format(month, 'MMM yyyy');
    monthlyData[key] = 0;
  }

  data?.forEach(inv => {
    const month = format(new Date(inv.created_at), 'MMM yyyy');
    if (monthlyData[month] !== undefined) {
      monthlyData[month] += inv.total_amount || 0;
    }
  });

  return Object.entries(monthlyData).map(([month, revenue]) => ({
    month,
    revenue,
  }));
}

export async function getAppointmentTrends(): Promise<{ date: string; scheduled: number; completed: number; cancelled: number }[]> {
  const thirtyDaysAgo = subMonths(new Date(), 1);

  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_date, status')
    .gte('appointment_date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
    .order('appointment_date');

  if (error) throw error;

  const dailyData: Record<string, { scheduled: number; completed: number; cancelled: number }> = {};

  data?.forEach(apt => {
    if (!dailyData[apt.appointment_date]) {
      dailyData[apt.appointment_date] = { scheduled: 0, completed: 0, cancelled: 0 };
    }
    switch (apt.status) {
      case 'scheduled':
        dailyData[apt.appointment_date].scheduled++;
        break;
      case 'completed':
        dailyData[apt.appointment_date].completed++;
        break;
      case 'cancelled':
        dailyData[apt.appointment_date].cancelled++;
        break;
    }
  });

  return Object.entries(dailyData)
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .slice(-14);
}

export async function getPatientRegistrationTrends(): Promise<{ month: string; count: number }[]> {
  const sixMonthsAgo = subMonths(new Date(), 6);

  const { data, error } = await supabase
    .from('patients')
    .select('created_at')
    .gte('created_at', sixMonthsAgo.toISOString())
    .order('created_at');

  if (error) throw error;

  const monthlyData: Record<string, number> = {};

  for (let i = 0; i < 6; i++) {
    const month = subMonths(new Date(), 5 - i);
    const key = format(month, 'MMM yyyy');
    monthlyData[key] = 0;
  }

  data?.forEach(patient => {
    const month = format(new Date(patient.created_at), 'MMM yyyy');
    if (monthlyData[month] !== undefined) {
      monthlyData[month]++;
    }
  });

  return Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count,
  }));
}
