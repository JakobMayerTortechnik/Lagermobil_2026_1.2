import { LayoutGrid, Calendar, TriangleAlert, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-card border-b p-4 flex items-center gap-4 sticky top-0 z-10">
        <LayoutGrid className="size-6 text-primary" />
        <h1 className="text-xl font-semibold font-headline">Dashboard</h1>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Heutige Termine
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                anstehende Aufträge heute
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bestands-Warnungen
              </CardTitle>
              <TriangleAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Artikel unter dem Soll-Bestand
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Letzte Aktivitäten</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-sm text-muted-foreground">
                    <p>Montage <span className="font-semibold text-foreground">AU-12345</span> abgeschlossen.</p>
                    <p>Verkauf <span className="font-semibold text-foreground">SP-1</span> protokolliert.</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
