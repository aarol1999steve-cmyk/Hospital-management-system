'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Phone, Mail, MapPin, AlertTriangle, Pill, Calendar, User, Droplet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getPatient, getAppointments, getMedicalRecords, getInvoices } from '@/lib/api';
import { Appointment } from '@/lib/types';
import { format } from 'date-fns';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId),
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: () => getAppointments({ patient_id: patientId }),
    enabled: !!patientId,
  });

  const { data: medicalRecords } = useQuery({
    queryKey: ['medical-records', patientId],
    queryFn: () => getMedicalRecords(patientId),
    enabled: !!patientId,
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices', patientId],
    queryFn: () => getInvoices({ patient_id: patientId }),
    enabled: !!patientId,
  });

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (patientLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 h-64 bg-muted animate-pulse rounded-lg" />
            <div className="md:col-span-2 h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Patient not found</h2>
          <Link href="/admin/patients">
            <Button variant="link" className="mt-4">
              Back to Patients
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold tracking-tight">{patient.full_name}</h2>
              <Badge variant="outline">{patient.patient_id}</Badge>
            </div>
            <p className="text-muted-foreground">
              Patient Profile
            </p>
          </div>
          <Link href={`/admin/appointments/new?patient=${patient.id}`}>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Patient Info Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span className="font-medium">
                    {format(new Date(patient.date_of_birth), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{calculateAge(patient.date_of_birth)} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize">{patient.gender}</span>
                </div>
                {patient.blood_group && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Blood Group</span>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      {patient.blood_group}
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{patient.address}</span>
                  </div>
                )}
              </div>

              {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Emergency Contact</h4>
                    {patient.emergency_contact_name && (
                      <p className="text-sm">{patient.emergency_contact_name}</p>
                    )}
                    {patient.emergency_contact_phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {patient.emergency_contact_phone}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Allergies & Medications */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.allergies && patient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy: string, i: number) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No known allergies</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Pill className="h-4 w-4" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.current_medications && patient.current_medications.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {patient.current_medications.map((med: string, i: number) => (
                        <li key={i} className="text-muted-foreground">
                          {med}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No current medications</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Medical Notes */}
            {patient.medical_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Medical Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {patient.medical_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Recent Visits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Visit History
                </CardTitle>
                <CardDescription>Past appointments and consultations</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((apt: Appointment) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">
                            {format(new Date(apt.appointment_date), 'MMM d, yyyy')} at{' '}
                            {apt.start_time?.slice(0, 5)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Dr. {apt.doctor?.profile?.full_name} - {apt.doctor?.specialization}
                          </p>
                        </div>
                        <Badge
                          variant={
                            apt.status === 'completed'
                              ? 'default'
                              : apt.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No visit history</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
