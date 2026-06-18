'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getAppointment, updateAppointment, createMedicalRecord, createPrescription, createInvoice } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Appointment } from '@/lib/types';
import { toast } from 'sonner';

const consultationSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

export default function ConsultationPage() {
  const params = useParams();
  const appointmentId = params.id as string;
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => getAppointment(appointmentId),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
  });

  const updateAptMutation = useMutation({
    mutationFn: (data: Partial<Appointment>) => updateAppointment(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Consultation completed');
    },
  });

  const completeConsultation = handleSubmit(async (data) => {
    if (!appointment) return;

    try {
      const doctorId = appointment.doctor_id;
      const patientId = appointment.patient_id;

      await createMedicalRecord({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_id: appointmentId,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms?.split(',').map(s => s.trim()).filter(Boolean),
        notes: data.notes,
      });

      await createInvoice({
        patient_id: patientId,
        appointment_id: appointmentId,
        consultation_fee: appointment.doctor?.consultation_fee || 0,
        payment_method: 'cash',
        payment_status: 'pending',
      });

      await updateAptMutation.mutateAsync({ status: 'completed', notes: data.notes });
    } catch (error) {
      toast.error('Failed to complete consultation');
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Appointment not found</h2>
          <Link href="/doctor/appointments">
            <Button variant="link" className="mt-4">Back to Appointments</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/doctor/appointments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">Consultation</h2>
            <p className="text-muted-foreground">
              {format(new Date(appointment.appointment_date), 'MMMM d, yyyy')} at {appointment.start_time?.slice(0, 5)}
            </p>
          </div>
          <Badge className={
            appointment.status === 'completed' ? 'bg-success/10 text-success' :
            appointment.status === 'scheduled' ? 'bg-primary/10 text-primary' :
            'bg-muted'
          }>
            {appointment.status}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{appointment.patient?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="font-medium">{appointment.patient?.patient_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{appointment.patient?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">
                  {appointment.patient?.date_of_birth
                    ? `${Math.floor((new Date().getTime() - new Date(appointment.patient.date_of_birth).getTime()) / 31557600000)} years`
                    : '-'}
                </p>
              </div>
              {appointment.patient?.allergies && appointment.patient.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Allergies</p>
                  <div className="flex gap-1 mt-1">
                    {appointment.patient.allergies.map((allergy: string, i: number) => (
                      <Badge key={i} variant="destructive" className="text-xs">{allergy}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultation Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Consultation Details</CardTitle>
              <CardDescription>
                Enter diagnosis and notes for this consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={completeConsultation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Enter symptoms (comma-separated)"
                    {...register('symptoms')}
                    disabled={appointment.status === 'completed'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis"
                    {...register('diagnosis')}
                    disabled={appointment.status === 'completed'}
                  />
                  {errors.diagnosis && (
                    <p className="text-sm text-destructive">{errors.diagnosis.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Consultation Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes, recommendations, follow-up instructions..."
                    {...register('notes')}
                    disabled={appointment.status === 'completed'}
                  />
                </div>

                {appointment.status !== 'completed' && appointment.status === 'scheduled' && (
                  <Button type="submit" disabled={updateAptMutation.isPending}>
                    {updateAptMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Complete Consultation
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
