"use client";

import { BookUser, ChevronRight } from 'lucide-react';
import type { Order } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: '1',
    commission: 'AU-12345',
    customer: {
      name: 'Max Mustermann',
      address: 'Musterstraße 1, 12345 Musterstadt',
    },
    type: 'Montage',
    status: 'In Arbeit',
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
    startTime: new Date(new Date().getTime() + 5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).toISOString(),
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

const getStatusVariant = (status: Order['status']): "default" | "secondary" | "outline" => {
    switch(status) {
        case 'Abgeschlossen': return 'default';
        case 'In Arbeit': return 'outline';
        case 'Geplant': return 'secondary';
        default: return 'secondary';
    }
}

const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: de });
}


export default function OrdersPage() {
  return (
    <div className="flex flex-col h-full bg-background">
       <header className="bg-card border-b p-4 flex items-center gap-4 sticky top-0 z-10">
        <BookUser className="size-6 text-primary" />
        <h1 className="text-xl font-semibold font-headline">Heutige Aufträge</h1>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="space-y-4">
            {mockOrders.map(order => (
                <Link href={`/orders/${order.id}`} key={order.id} className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                           <div className={cn("w-2 h-20 rounded-full", getTypeColor(order.type))} />
                           <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-semibold">{order.commission}</p>
                                     <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
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
      </main>
    </div>
  );
}
