'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Patient } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const patientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  blood_group: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  medical_notes: z.string().optional(),
  allergies: z.string().optional(),
  current_medications: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  initialData?: Patient | null;
  onSubmit: (data: Partial<Patient>) => void;
  isLoading?: boolean;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function PatientForm({ initialData, onSubmit, isLoading }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          allergies: initialData.allergies?.join(', ') || '',
          current_medications: initialData.current_medications?.join(', ') || '',
        }
      : undefined,
  });

  const gender = watch('gender');

  const processSubmit = (data: PatientFormData) => {
    const processedData: Partial<Patient> = {
      ...data,
      allergies: data.allergies?.split(',').map(a => a.trim()).filter(Boolean),
      current_medications: data.current_medications?.split(',').map(m => m.trim()).filter(Boolean),
    };
    onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            placeholder="John Doe"
            {...register('full_name')}
            disabled={isLoading}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register('date_of_birth')}
            disabled={isLoading}
          />
          {errors.date_of_birth && (
            <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select
            defaultValue={initialData?.gender || 'male'}
            onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-destructive">{errors.gender.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="blood_group">Blood Group</Label>
          <Select
            defaultValue={initialData?.blood_group || ''}
            onValueChange={(value) => setValue('blood_group', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              {bloodGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            placeholder="+1 234 567 890"
            {...register('phone')}
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="123 Main St, City, State, ZIP"
            {...register('address')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
          <Input
            id="emergency_contact_name"
            placeholder="Jane Doe"
            {...register('emergency_contact_name')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
          <Input
            id="emergency_contact_phone"
            placeholder="+1 234 567 890"
            {...register('emergency_contact_phone')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="allergies">Allergies</Label>
          <Input
            id="allergies"
            placeholder="Peanuts, Penicillin (comma-separated)"
            {...register('allergies')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="current_medications">Current Medications</Label>
          <Input
            id="current_medications"
            placeholder="Aspirin, Metformin (comma-separated)"
            {...register('current_medications')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="medical_notes">Medical Notes</Label>
          <Textarea
            id="medical_notes"
            placeholder="Any additional medical information..."
            {...register('medical_notes')}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Patient' : 'Add Patient'}
        </Button>
      </div>
    </form>
  );
}
