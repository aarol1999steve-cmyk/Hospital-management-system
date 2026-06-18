'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CalendarDays, Clock, Filter, CheckCircle, XCircle, AlertCircle, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getAppointments, getPatients, getDoctors, getDepartments, updateAppointment, getAvailableTimeSlots } from '@/lib/api';
import { Appointment, AppointmentStatus } from '@/lib/types';
import { AppointmentForm } from '@/components/appointment-form';
import { toast } from 'sonner';

const statusConfig: Record<AppointmentStatus, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'bg-primary/10 text-primary border-primary/20' },
  completed: { label: 'Completed', color: 'bg-success/10 text-success border-success/20' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  no_show: { label: 'No Show', color: 'bg-warning/10 text-warning border-warning/20' },
};

export default function AppointmentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', statusFilter, dateFilter],
    queryFn: () => getAppointments({
      status: statusFilter === 'all' ? undefined : statusFilter,
      date: dateFilter || undefined,
    }),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => getPatients(),
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => getDoctors(),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment updated successfully');
      setSelectedAppointment(null);
    },
    onError: () => {
      toast.error('Failed to update appointment');
    },
  });

  const handleStatusChange = (appointment: Appointment, status: AppointmentStatus) => {
    updateMutation.mutate({ id: appointment.id, data: { status } });
  };

  const filteredAppointments = appointments?.filter((apt: Appointment) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        apt.patient?.full_name.toLowerCase().includes(searchLower) ||
        apt.doctor?.profile?.full_name.toLowerCase().includes(searchLower) ||
        apt.reason_for_visit?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
            <p className="text-muted-foreground">
              Schedule and manage patient appointments
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Appointments</CardTitle>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-48"
                  />
                </div>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full sm:w-40"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : filteredAppointments?.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No appointments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments?.map((appointment: Appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.start_time?.slice(0, 5)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.patient?.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.patient?.patient_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">Dr. {appointment.doctor?.profile?.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.doctor?.specialization}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.department?.name || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {appointment.reason_for_visit || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[appointment.status].color}>
                            {statusConfig[appointment.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedAppointment(appointment)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {appointment.status === 'scheduled' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(appointment, 'completed')}
                                    className="text-success"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(appointment, 'cancelled')}
                                    className="text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(appointment, 'no_show')}
                                  >
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Mark No Show
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Appointment Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule an appointment for a patient
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              patients={patients || []}
              doctors={doctors || []}
              departments={departments || []}
              onClose={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedAppointment.patient?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-medium">Dr. {selectedAppointment.doctor?.profile?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedAppointment.appointment_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {selectedAppointment.start_time?.slice(0, 5)} - {selectedAppointment.end_time?.slice(0, 5)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusConfig[selectedAppointment.status].color}>
                      {statusConfig[selectedAppointment.status].label}
                    </Badge>
                  </div>
                </div>
                {selectedAppointment.reason_for_visit && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reason for Visit</p>
                    <p className="mt-1">{selectedAppointment.reason_for_visit}</p>
                  </div>
                )}
                {selectedAppointment.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="mt-1">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
