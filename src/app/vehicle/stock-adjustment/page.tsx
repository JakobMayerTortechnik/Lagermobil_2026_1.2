"use client";

import { SlidersHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsTable } from '@/components/settings-table';


export default function StockAdjustmentPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-card border-b p-4 flex items-center gap-4 sticky top-0 z-10">
        <SlidersHorizontal className="size-6 text-primary" />
        <h1 className="text-xl font-semibold font-headline">Bestandsanpassung</h1>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <Tabs defaultValue="assembly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="assembly">Montagematerial</TabsTrigger>
                <TabsTrigger value="spareParts">Ersatzteile</TabsTrigger>
                <TabsTrigger value="tools">Werkzeuge</TabsTrigger>
            </TabsList>
            <TabsContent value="assembly">
                <div className="pt-4">
                    <SettingsTable itemType="assembly" />
                </div>
            </TabsContent>
            <TabsContent value="spareParts">
                <div className="pt-4">
                    <SettingsTable itemType="spareParts" />
                </div>
            </TabsContent>
            <TabsContent value="tools">
                <div className="pt-4">
                    <SettingsTable itemType="tools" />
                </div>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
