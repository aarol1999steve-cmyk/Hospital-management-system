-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin can manage all profiles
CREATE POLICY "admin_select_profiles" ON public.profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "admin_update_profiles" ON public.profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Departments policies (all authenticated users can read)
CREATE POLICY "select_departments" ON public.departments FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "admin_manage_departments" ON public.departments FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Doctors policies - all authenticated can read, admin manages
CREATE POLICY "select_doctors" ON public.doctors FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "admin_manage_doctors" ON public.doctors FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "doctor_own_record" ON public.doctors FOR UPDATE
  TO authenticated USING (profile_id = auth.uid());

-- Patients policies - doctors and receptionists can manage
CREATE POLICY "select_patients" ON public.patients FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_patients" ON public.patients FOR INSERT
  TO authenticated 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'receptionist'))
    OR
    EXISTS (SELECT 1 FROM public.doctors d JOIN public.profiles p ON d.profile_id = p.id WHERE p.id = auth.uid())
  );
CREATE POLICY "update_patients" ON public.patients FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'receptionist'))
    OR
    EXISTS (SELECT 1 FROM public.doctors d JOIN public.profiles p ON d.profile_id = p.id WHERE p.id = auth.uid())
  );
CREATE POLICY "delete_patients" ON public.patients FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Appointments policies
CREATE POLICY "select_appointments" ON public.appointments FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_appointments" ON public.appointments FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_appointments" ON public.appointments FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "delete_appointments" ON public.appointments FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Medical records policies
CREATE POLICY "select_medical_records" ON public.medical_records FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_medical_records" ON public.medical_records FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_medical_records" ON public.medical_records FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "delete_medical_records" ON public.medical_records FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Prescriptions policies
CREATE POLICY "select_prescriptions" ON public.prescriptions FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_prescriptions" ON public.prescriptions FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_prescriptions" ON public.prescriptions FOR UPDATE
  TO authenticated USING (true);

-- Prescription items policies
CREATE POLICY "select_prescription_items" ON public.prescription_items FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_prescription_items" ON public.prescription_items FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_prescription_items" ON public.prescription_items FOR UPDATE
  TO authenticated USING (true);

-- Invoices policies
CREATE POLICY "select_invoices" ON public.invoices FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_invoices" ON public.invoices FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_invoices" ON public.invoices FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "delete_invoices" ON public.invoices FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Invoice items policies
CREATE POLICY "select_invoice_items" ON public.invoice_items FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_invoice_items" ON public.invoice_items FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_invoice_items" ON public.invoice_items FOR UPDATE
  TO authenticated USING (true);

-- Notifications policies
CREATE POLICY "select_notifications" ON public.notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "delete_notifications" ON public.notifications FOR DELETE
  TO authenticated USING (user_id = auth.uid());