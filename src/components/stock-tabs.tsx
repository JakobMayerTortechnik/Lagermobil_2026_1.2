"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockTable } from "./stock-table";

export function StockTabs() {
  return (
    <Tabs defaultValue="assembly" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="assembly">Montagematerial</TabsTrigger>
        <TabsTrigger value="spareParts">Ersatzteile</TabsTrigger>
        <TabsTrigger value="tools">Werkzeuge</TabsTrigger>
      </TabsList>
      <TabsContent value="assembly">
         <div className="pt-4">
            <StockTable itemType="assembly" />
         </div>
      </TabsContent>
      <TabsContent value="spareParts">
         <div className="pt-4">
            <StockTable itemType="spareParts" />
         </div>
      </TabsContent>
      <TabsContent value="tools">
        <div className="pt-4">
            <StockTable itemType="tools" />
         </div>
      </TabsContent>
    </Tabs>
  )
}
