'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Phone, Mail, Clock } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getDoctors, getDepartments } from '@/lib/api';
import { Doctor } from '@/lib/types';
import Link from 'next/link';

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', search, departmentFilter],
    queryFn: () => getDoctors(search),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const filteredDoctors = doctors?.filter((doc: Doctor) => {
    if (departmentFilter === 'all') return true;
    return doc.department_id === departmentFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Doctors</h2>
          <p className="text-muted-foreground">
            View and manage medical staff
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Medical Staff</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredDoctors?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No doctors found</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors?.map((doctor: Doctor) => (
                  <Card key={doctor.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={doctor.profile?.avatar_url} />
                          <AvatarFallback className="text-lg">
                            {doctor.profile?.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            Dr. {doctor.profile?.full_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialization}
                          </p>
                          {doctor.department && (
                            <Badge variant="outline">{doctor.department.name}</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {doctor.available_days?.slice(0, 3).map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')}
                          {' '}
                          {doctor.start_time?.slice(0, 5)} - {doctor.end_time?.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{doctor.profile?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">
                          {doctor.experience_years} years exp
                        </span>
                        <Badge className="bg-primary/10 text-primary">
                          ${doctor.consultation_fee}/visit
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
