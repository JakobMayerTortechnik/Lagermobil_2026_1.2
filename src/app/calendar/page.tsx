"use client";

import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import type { Order } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const generateMockOrders = (): Order[] => [
  {
    id: '1',
    commission: 'AU-12345',
    customer: {
      name: 'Max Mustermann',
      address: 'Musterstraße 1, 12345 Musterstadt',
    },
    type: 'Montage',
    status: 'Geplant',
    startTime: new Date().toISOString(),
    endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    commission: 'AU-12346',
    customer: {
      name: 'Erika Musterfrau',
      address: 'Beispielweg 2, 54321 Beispielhausen',
    },
    type: 'Reparatur',
    status: 'Geplant',
    startTime: new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000).toISOString(),
  },
    {
    id: '3',
    commission: 'AU-12347',
    customer: {
      name: 'John Doe',
      address: 'Testallee 3, 98765 Testdorf',
    },
    type: 'Reklamation',
    status: 'Geplant',
    startTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endTime: new Date(new Date().getTime() + 25.5 * 60 * 60 * 1000).toISOString(),
  },
];


const getTypeColor = (type: Order['type']) => {
    switch (type) {
        case 'Montage': return 'bg-green-500';
        case 'Angebot': return 'bg-yellow-500';
        case 'Reparatur': return 'bg-blue-500';
        case 'Reklamation': return 'bg-red-500';
        case 'Urlaub': return 'bg-orange-500';
        default: return 'bg-gray-500';
    }
}

const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: de });
}

const formatDate = (date: string) => {
    const d = new Date(date);
    // Add timezone offset to avoid date shifting
    const adjustedDate = new Date(d.valueOf() + d.getTimezoneOffset() * 60 * 1000);
    return format(adjustedDate, 'eeee, dd. MMMM', { locale: de });
}

export default function CalendarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setOrders(generateMockOrders());
    setIsClient(true);
  }, []);

  const { groupedOrders, sortedDays } = useMemo(() => {
      if (!isClient) return { groupedOrders: {}, sortedDays: [] };
      
      const grouped = orders.reduce((acc, order) => {
          const day = format(new Date(order.startTime), 'yyyy-MM-dd');
          if (!acc[day]) {
              acc[day] = [];
          }
          acc[day].push(order);
          return acc;
      }, {} as Record<string, Order[]>);

      const sorted = Object.keys(grouped).sort();

      return { groupedOrders: grouped, sortedDays: sorted };
  }, [orders, isClient]);


  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-card border-b p-4 flex items-center gap-4 sticky top-0 z-10">
        <CalendarIcon className="size-6 text-primary" />
        <h1 className="text-xl font-semibold font-headline">Terminübersicht</h1>
      </header>
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="space-y-6">
            {!isClient ? (
                 <div className="text-center py-16 text-muted-foreground">
                    <CalendarIcon className="mx-auto size-12 mb-4 animate-pulse" />
                    <h3 className="text-lg font-semibold">Kalender wird geladen...</h3>
                </div>
            ) : sortedDays.length > 0 ? (
                sortedDays.map(day => (
                    <div key={day}>
                        <h2 className="text-lg font-semibold font-headline sticky top-0 bg-background py-2 mb-2">
                           {formatDate(day)}
                        </h2>
                        <div className="space-y-4">
                        {groupedOrders[day].map(order => (
                            <Link href={`/orders/${order.id}`} key={order.id} className="block">
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4 flex items-center gap-4">
                                       <div className={cn("w-2 h-20 rounded-full", getTypeColor(order.type))} />
                                       <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-semibold">{order.commission}</p>
                                                 <Badge variant={order.status === 'Abgeschlossen' ? 'default' : 'secondary'}>{order.status}</Badge>
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">{formatTime(order.startTime)} - {formatTime(order.endTime)} Uhr</p>
                                            <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                                            <p className="text-xs text-muted-foreground">{order.customer.address}</p>
                                       </div>
                                       <ChevronRight className="size-5 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <CalendarIcon className="mx-auto size-12 mb-4" />
                    <h3 className="text-lg font-semibold">Keine Termine geplant</h3>
                    <p className="text-sm">Für die nächste Zeit sind keine Aufträge vorhanden.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
