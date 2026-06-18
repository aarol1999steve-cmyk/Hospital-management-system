'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Users, Calendar, Clock, DollarSign, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getDashboardStats, getAppointments, getPatients } from '@/lib/api';
import { Appointment, Patient } from '@/lib/types';
import Link from 'next/link';

export default function ReceptionistDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const { data: todayAppointments } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => getAppointments({ date: format(new Date(), 'yyyy-MM-dd') }),
  });

  const { data: recentPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => getPatients(),
  });

  const upcomingAppointments = todayAppointments?.filter((a: Appointment) => a.status === 'scheduled') || [];
  const completedAppointments = todayAppointments?.filter((a: Appointment) => a.status === 'completed') || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reception Dashboard</h2>
            <p className="text-muted-foreground">
              Manage appointments and patient registration
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/receptionist/appointments/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </Link>
            <Link href="/receptionist/patients/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Register Patient
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +12% this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${completedAppointments.reduce((sum: number, apt: Appointment) => sum + (apt.doctor?.consultation_fee || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">From completed visits</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today&apos;s Schedule</CardTitle>
                  <CardDescription>
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <Link href="/receptionist/appointments">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 6).map((apt: Appointment) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center text-center min-w-[60px]">
                          <span className="text-lg font-bold">{apt.start_time?.slice(0, 5)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{apt.patient?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Dr. {apt.doctor?.profile?.full_name} | {apt.doctor?.specialization}
                          </p>
                        </div>
                      </div>
                      <Badge>
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Patients</CardTitle>
                  <CardDescription>Latest registrations</CardDescription>
                </div>
                <Link href="/receptionist/patients">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentPatients && recentPatients.length > 0 ? (
                <div className="space-y-4">
                  {recentPatients.slice(0, 6).map((patient: Patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{patient.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {patient.patient_id} | {patient.phone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/receptionist/patients/${patient.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Link href={`/receptionist/appointments/new?patient=${patient.id}`}>
                          <Button size="sm">Book</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No patients registered yet</p>
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
            <div className="grid gap-4 md:grid-cols-4">
              <Link href="/receptionist/patients">
                <Button variant="outline" className="w-full h-16">
                  <Users className="mr-2 h-5 w-5" />
                  Manage Patients
                </Button>
              </Link>
              <Link href="/receptionist/appointments">
                <Button variant="outline" className="w-full h-16">
                  <Calendar className="mr-2 h-5 w-5" />
                  Appointments
                </Button>
              </Link>
              <Link href="/receptionist/doctors">
                <Button variant="outline" className="w-full h-16">
                  <Users className="mr-2 h-5 w-5" />
                  View Doctors
                </Button>
              </Link>
              <Link href="/receptionist/billing">
                <Button variant="outline" className="w-full h-16">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Billing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
