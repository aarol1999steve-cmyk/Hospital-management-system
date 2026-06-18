'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Users, Calendar, Clock, CheckCircle, Activity, FileText, Pill, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DashboardLayout
} from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { getAppointments } from '@/lib/api';
import { Appointment } from '@/lib/types';
import Link from 'next/link';

export default function DoctorDashboard() {
  const { profile } = useAuth();

  const { data: doctor, isLoading: doctorLoading } = useQuery({
    queryKey: ['doctor', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(*),
          department:departments(*)
        `)
        .eq('profile_id', profile?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const { data: appointments, isLoading: aptLoading } = useQuery({
    queryKey: ['doctor-appointments', doctor?.id],
    queryFn: () => doctor ? getAppointments({ doctor_id: doctor.id }) : Promise.resolve([]),
    enabled: !!doctor?.id,
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments?.filter(
    (apt: Appointment) => apt.appointment_date === today && apt.status === 'scheduled'
  ) || [];

  const upcomingAppointments = appointments?.filter(
    (apt: Appointment) => apt.appointment_date > today && apt.status === 'scheduled'
  )?.slice(0, 5) || [];

  const completedToday = appointments?.filter(
    (apt: Appointment) => apt.appointment_date === today && apt.status === 'completed'
  )?.length || 0;

  if (doctorLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome, Dr. {doctor?.profile?.full_name}
          </h2>
          <p className="text-muted-foreground">
            {doctor?.specialization} {doctor?.department ? `- ${doctor.department.name}` : ''}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday}</div>
              <p className="text-xs text-muted-foreground">Consultations done</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">&gt; Future appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments?.filter((a: Appointment) => a.status === 'completed').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today&apos;s Schedule</CardTitle>
                  <CardDescription>
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <Badge>{todayAppointments.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {aptLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((apt: Appointment) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center text-center">
                          <span className="text-2xl font-bold">
                            {apt.start_time?.slice(0, 5)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {apt.end_time?.slice(0, 5)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{apt.patient?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {apt.patient?.patient_id} | {apt.patient?.phone}
                          </p>
                          {apt.reason_for_visit && (
                            <p className="text-sm text-muted-foreground">
                              Reason: {apt.reason_for_visit}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/doctor/appointments/${apt.id}`}>
                          <Button size="sm">Start Consultation</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Future scheduled consultations</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt: Appointment) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            {format(new Date(apt.appointment_date), 'MMM d')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {apt.start_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{apt.patient?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {apt.reason_for_visit || 'No reason specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/doctor/patients">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  View Patients
                </Button>
              </Link>
              <Link href="/doctor/appointments">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  All Appointments
                </Button>
              </Link>
              <Link href="/doctor/medical-records">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  Medical Records
                </Button>
              </Link>
              <Link href="/doctor/prescriptions">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Pill className="h-6 w-6" />
                  Prescriptions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
