'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Patient, Doctor, Department, TimeSlot } from '@/lib/types';
import { createAppointment, getAvailableTimeSlots, getDoctorsByDepartment } from '@/lib/api';
import { toast } from 'sonner';

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  doctor_id: z.string().min(1, 'Doctor is required'),
  department_id: z.string().optional(),
  appointment_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Time slot is required'),
  reason_for_visit: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  preselectedPatient?: string;
  onClose?: () => void;
}

export function AppointmentForm({
  patients,
  doctors: initialDoctors,
  departments,
  preselectedPatient,
  onClose,
}: AppointmentFormProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: filteredDoctors } = useQuery({
    queryKey: ['doctors', selectedDepartment],
    queryFn: () => selectedDepartment
      ? getDoctorsByDepartment(selectedDepartment)
      : Promise.resolve(initialDoctors),
    enabled: !!selectedDepartment,
    initialData: initialDoctors,
  });

  const { data: timeSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['time-slots', selectedDoctor, selectedDate],
    queryFn: () => getAvailableTimeSlots(selectedDoctor, selectedDate),
    enabled: !!selectedDoctor && !!selectedDate,
  });

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment booked successfully');
      onClose?.();
    },
    onError: () => {
      toast.error('Failed to book appointment');
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: preselectedPatient || '',
    },
  });

  const onSubmit = (data: AppointmentFormData) => {
    const selectedSlot = timeSlots?.find((slot: TimeSlot) => slot.start_time === data.start_time);
    if (!selectedSlot?.is_available) {
      toast.error('Selected time slot is not available');
      return;
    }
    createMutation.mutate({
      ...data,
      end_time: selectedSlot.end_time,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="patient_id">Patient *</Label>
          <Select
            value={watch('patient_id')}
            onValueChange={(value) => setValue('patient_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.full_name} ({patient.patient_id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.patient_id && (
            <p className="text-sm text-destructive">{errors.patient_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department_id">Department</Label>
          <Select
            value={selectedDepartment}
            onValueChange={(value) => {
              setSelectedDepartment(value);
              setValue('department_id', value);
              setValue('doctor_id', '');
              setSelectedDoctor('');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor_id">Doctor *</Label>
          <Select
            value={watch('doctor_id')}
            onValueChange={(value) => {
              setValue('doctor_id', value);
              setSelectedDoctor(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {(filteredDoctors || initialDoctors)?.map((doctor: Doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  Dr. {doctor.profile?.full_name} - {doctor.specialization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.doctor_id && (
            <p className="text-sm text-destructive">{errors.doctor_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointment_date">Date *</Label>
          <Input
            id="appointment_date"
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            {...register('appointment_date')}
            onChange={(e) => {
              register('appointment_date').onChange(e);
              setSelectedDate(e.target.value);
              setValue('start_time', '');
            }}
          />
          {errors.appointment_date && (
            <p className="text-sm text-destructive">{errors.appointment_date.message}</p>
          )}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDoctor && selectedDate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Available Time Slots</CardTitle>
            <CardDescription>
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : timeSlots && timeSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot: TimeSlot) => (
                  <Button
                    key={`${slot.start_time}-${slot.end_time}`}
                    type="button"
                    variant={watch('start_time') === slot.start_time ? 'default' : 'outline'}
                    size="sm"
                    disabled={!slot.is_available}
                    onClick={() => setValue('start_time', slot.start_time)}
                  >
                    {slot.start_time.slice(0, 5)}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No available slots. The doctor may not be available on this day.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {errors.start_time && !watch('start_time') && (
        <p className="text-sm text-destructive">{errors.start_time.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason_for_visit">Reason for Visit</Label>
        <Textarea
          id="reason_for_visit"
          placeholder="Describe the reason for this appointment..."
          {...register('reason_for_visit')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes..."
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-4">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createMutation.isPending || !watch('start_time')}>
          {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Book Appointment
        </Button>
      </div>
    </form>
  );
}
