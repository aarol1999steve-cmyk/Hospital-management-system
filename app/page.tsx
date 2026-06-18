'use client';

import Link from 'next/link';
import { Activity, Users, CalendarDays, Stethoscope, Receipt, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Users,
    title: 'Patient Management',
    description: 'Comprehensive patient records with medical history, allergies, and emergency contacts.',
  },
  {
    icon: CalendarDays,
    title: 'Smart Scheduling',
    description: 'Intelligent appointment booking with automatic conflict detection and time slot management.',
  },
  {
    icon: Stethoscope,
    title: 'Doctor Dashboard',
    description: 'Dedicated doctor interface with patient management, prescriptions, and consultation notes.',
  },
  {
    icon: Receipt,
    title: 'Billing System',
    description: 'Automated invoice generation with multiple payment methods and revenue tracking.',
  },
  {
    icon: Activity,
    title: 'Analytics',
    description: 'Real-time insights with revenue tracking, appointment trends, and performance metrics.',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Role-based access control ensuring data security and compliance.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">MediCare HMS</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Modern Hospital Management Made{' '}
              <span className="text-primary">Simple</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Streamline your hospital operations with our comprehensive management system.
              From patient records to billing, everything you need in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Everything You Need</h2>
            <p className="mt-4 text-muted-foreground">
              Powerful features designed for modern healthcare facilities
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-primary">MediCare HMS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MediCare HMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
