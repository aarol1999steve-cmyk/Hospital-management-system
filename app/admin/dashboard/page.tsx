'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Stethoscope, CalendarDays, DollarSign, TrendingUp, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getDashboardStats, getMonthlyRevenue, getAppointmentTrends, getPatientRegistrationTrends, getAppointments } from '@/lib/api';
import { Appointment } from '@/lib/types';
import { format, isToday } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: getMonthlyRevenue,
  });

  const { data: appointmentTrends, isLoading: aptTrendsLoading } = useQuery({
    queryKey: ['appointment-trends'],
    queryFn: getAppointmentTrends,
  });

  const { data: patientTrends, isLoading: patientTrendsLoading } = useQuery({
    queryKey: ['patient-registration-trends'],
    queryFn: getPatientRegistrationTrends,
  });

  const { data: todayAppointments } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => getAppointments({ date: format(new Date(), 'yyyy-MM-dd') }),
  });

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.total_patients || 0,
      icon: Users,
      change: '+12%',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Doctors',
      value: stats?.total_doctors || 0,
      icon: Stethoscope,
      change: '+3%',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Appointments Today',
      value: stats?.appointments_today || 0,
      icon: CalendarDays,
      change: '+8%',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.revenue_generated || 0).toLocaleString()}`,
      icon: DollarSign,
      change: '+15%',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const upcomingAppointments = todayAppointments
    ?.filter((apt: Appointment) => apt.status === 'scheduled')
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your hospital today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-success" />
                      {stat.change} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue generated over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.1)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Patient Registration Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Registrations</CardTitle>
              <CardDescription>New patient sign-ups over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {patientTrendsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={patientTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointment Trends & Today's Appointments */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Appointment Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Trends</CardTitle>
              <CardDescription>Daily appointment status over the last 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              {aptTrendsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={appointmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="scheduled" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" stroke="hsl(var(--success))" strokeWidth={2} />
                    <Line type="monotone" dataKey="cancelled" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Appointments</CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No appointments scheduled for today
                  </p>
                ) : (
                  upcomingAppointments?.map((apt: Appointment) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{apt.patient?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Dr. {apt.doctor?.profile?.full_name} • {apt.doctor?.specialization}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {apt.start_time?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayAppointments?.filter((a: Appointment) => a.status === 'scheduled').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Pending appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayAppointments?.filter((a: Appointment) => a.status === 'completed').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayAppointments?.filter((a: Appointment) => a.status === 'cancelled').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
