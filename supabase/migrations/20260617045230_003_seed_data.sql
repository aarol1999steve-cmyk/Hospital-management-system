-- Insert departments
INSERT INTO public.departments (id, name, description) VALUES
  (uuid_generate_v4(), 'Cardiology', 'Heart and cardiovascular system care'),
  (uuid_generate_v4(), 'Dermatology', 'Skin, hair, and nail conditions'),
  (uuid_generate_v4(), 'Orthopedics', 'Bones, joints, and musculoskeletal system'),
  (uuid_generate_v4(), 'Pediatrics', 'Medical care for infants, children, and adolescents'),
  (uuid_generate_v4(), 'Neurology', 'Brain and nervous system disorders'),
  (uuid_generate_v4(), 'Gynecology', 'Women reproductive health'),
  (uuid_generate_v4(), 'General Medicine', 'Primary care and general health'),
  (uuid_generate_v4(), 'ENT', 'Ear, nose, and throat specialists');

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'receptionist')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();