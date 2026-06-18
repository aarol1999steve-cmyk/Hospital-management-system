-- Insert sample patients
INSERT INTO public.patients (id, full_name, date_of_birth, gender, blood_group, phone, email, address, emergency_contact_name, emergency_contact_phone, allergies, current_medications) VALUES
  (uuid_generate_v4(), 'John Smith', '1985-03-15', 'male', 'A+', '+1-555-0101', 'john.smith@email.com', '123 Main Street, New York, NY 10001', 'Mary Smith', '+1-555-0102', ARRAY['Penicillin'], ARRAY['Aspirin']),
  (uuid_generate_v4(), 'Emily Johnson', '1990-07-22', 'female', 'B-', '+1-555-0201', 'emily.j@email.com', '456 Oak Avenue, Los Angeles, CA 90001', 'Robert Johnson', '+1-555-0202', ARRAY[]::TEXT[], ARRAY['Metformin']),
  (uuid_generate_v4(), 'Michael Williams', '1978-11-08', 'male', 'O+', '+1-555-0301', 'mwilliams@email.com', '789 Pine Road, Chicago, IL 60601', 'Sarah Williams', '+1-555-0302', ARRAY['Sulfa', 'Latex'], ARRAY['Lisinopril', 'Atorvastatin']),
  (uuid_generate_v4(), 'Sarah Davis', '1995-01-30', 'female', 'AB+', '+1-555-0401', 'sarah.d@email.com', '321 Elm Street, Houston, TX 77001', 'Tom Davis', '+1-555-0402', ARRAY[]::TEXT[], ARRAY[]::TEXT[]),
  (uuid_generate_v4(), 'James Brown', '1982-09-12', 'male', 'A-', '+1-555-0501', 'jbrown@email.com', '654 Cedar Lane, Phoenix, AZ 85001', 'Lisa Brown', '+1-555-0502', ARRAY['Aspirin'], ARRAY['Omeprazole']),
  (uuid_generate_v4(), 'Jennifer Miller', '1988-05-25', 'female', 'B+', '+1-555-0601', 'jmiller@email.com', '987 Birch Drive, Philadelphia, PA 19101', 'David Miller', '+1-555-0602', ARRAY[]::TEXT[], ARRAY['Levothyroxine']),
  (uuid_generate_v4(), 'Robert Taylor', '1975-12-03', 'male', 'O-', '+1-555-0701', 'rtaylor@email.com', '147 Maple Court, San Antonio, TX 78201', 'Carol Taylor', '+1-555-0702', ARRAY['Codeine'], ARRAY['Metoprolol']),
  (uuid_generate_v4(), 'Amanda White', '1992-04-18', 'female', 'A+', '+1-555-0801', 'awhite@email.com', '258 Spruce Way, San Diego, CA 92101', 'Mark White', '+1-555-0802', ARRAY[]::TEXT[], ARRAY[]::TEXT[]);

-- Get department IDs
DO $$
DECLARE
  cardiology_id UUID;
  dermatology_id UUID;
  orthopedics_id UUID;
  pediatrics_id UUID;
  neurology_id UUID;
  gynecology_id UUID;
  general_id UUID;
  ent_id UUID;
BEGIN
  SELECT id INTO cardiology_id FROM departments WHERE name = 'Cardiology';
  SELECT id INTO dermatology_id FROM departments WHERE name = 'Dermatology';
  SELECT id INTO orthopedics_id FROM departments WHERE name = 'Orthopedics';
  SELECT id INTO pediatrics_id FROM departments WHERE name = 'Pediatrics';
  SELECT id INTO neurology_id FROM departments WHERE name = 'Neurology';
  SELECT id INTO gynecology_id FROM departments WHERE name = 'Gynecology';
  SELECT id INTO general_id FROM departments WHERE name = 'General Medicine';
  SELECT id INTO ent_id FROM departments WHERE name = 'ENT';

  -- These are placeholder doctor records. Users should sign up to create actual accounts.
  -- The doctors table should be populated via the signup flow.
END $$;