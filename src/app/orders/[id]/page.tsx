"use client";

import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Camera, Image as ImageIcon, Save, Mail, Eraser, PackagePlus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from '@/hooks/use-toast';
import { ConsumptionDialog } from '@/components/consumption-dialog';
import type { Item, AssemblyItem, ItemType } from '@/lib/types';
import { initialItems, initialSpareParts, initialTools } from '@/lib/mock-data';

const itemTypeConfig = {
    assembly: { storageKey: 'items', initialData: initialItems },
    spareParts: { storageKey: 'spare_parts_items', initialData: initialSpareParts },
    tools: { storageKey: 'tool_items', initialData: initialTools },
};


export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const sigPad = useRef<SignatureCanvas>(null);
  const { toast } = useToast();
  const [isConsumptionDialogOpen, setConsumptionDialogOpen] = useState(false);
  const [consumedItems, setConsumedItems] = useState<AssemblyItem[]>([]);
  const [stockItems, setStockItems] = useState<Item[]>([]);
  const [isClient, setIsClient] = useState(false);

   useEffect(() => {
    // In a real app, you'd fetch this data. Here we load all items from localStorage/mock.
    const allItems: Item[] = [];
    Object.values(itemTypeConfig).forEach(({ storageKey, initialData }) => {
        const savedItems = localStorage.getItem(storageKey);
        allItems.push(...(savedItems ? JSON.parse(savedItems) : initialData));
    });
    setStockItems(allItems);
    setIsClient(true);
  }, []);


  const clearSignature = () => {
    sigPad.current?.clear();
    toast({ title: "Unterschrift gelöscht" });
  };

  const saveSignature = () => {
    if (sigPad.current?.isEmpty()) {
        toast({
            variant: "destructive",
            title: "Fehler",
            description: "Das Unterschriftenfeld ist leer.",
        });
        return;
    }
    const signatureData = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
    // In a real app, you would save this data
    console.log(signatureData);
    toast({ 
        title: "Unterschrift gespeichert",
        description: "Die Unterschrift wurde erfolgreich erfasst."
    });
  };

  const handleSaveConsumption = (newlyConsumedItems: Record<string, number>) => {
    const consumptionList: AssemblyItem[] = [];
    let stockUpdated = false;

    const itemsByType: Record<ItemType, Item[]> = {
      assembly: [],
      spareParts: [],
      tools: []
    }
    
    stockItems.forEach(item => itemsByType[item.type].push(item));

    Object.keys(itemsByType).forEach(type => {
      const typedItems = itemsByType[type as ItemType];
      const storageKey = itemTypeConfig[type as ItemType].storageKey;

      const updatedItems = typedItems.map(stockItem => {
        const consumedQuantity = newlyConsumedItems[stockItem.id] || 0;
        if(consumedQuantity > 0) {
            if (stockItem.currentStock >= consumedQuantity) {
                 consumptionList.push({
                    itemId: stockItem.id,
                    name: stockItem.name,
                    articleNumber: stockItem.articleNumber,
                    quantityConsumed: consumedQuantity,
                });
                stockUpdated = true;
                return { ...stockItem, currentStock: stockItem.currentStock - consumedQuantity };
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Nicht genügend Lagerbestand',
                    description: `Für ${stockItem.name} ist die Menge nicht verfügbar.`,
                });
                return stockItem;
            }
        }
        return stockItem;
      });

      if (updatedItems.some((item, index) => item.currentStock !== typedItems[index].currentStock)) {
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
      }
    });


    if (stockUpdated) {
        // reload stock from storage to reflect all changes
        const allItems: Item[] = [];
        Object.values(itemTypeConfig).forEach(({ storageKey, initialData }) => {
            const savedItems = localStorage.getItem(storageKey);
            allItems.push(...(savedItems ? JSON.parse(savedItems) : initialData));
        });
        setStockItems(allItems);

        setConsumedItems(prev => [...prev, ...consumptionList]);
        toast({
            title: "Materialverbrauch gespeichert",
            description: "Der Lagerbestand wurde aktualisiert.",
        });
    }
    setConsumptionDialogOpen(false);
  }
  
  const finishOrder = () => {
    // Logic to save order, consumption, signature etc.
    toast({
        title: "Auftrag abgeschlossen",
        description: "Alle Daten wurden erfolgreich gespeichert.",
        className: "bg-green-500 text-white"
    })
  }

  return (
    <>
      <div className="flex flex-col h-full bg-background pb-24">
        <header className="bg-card border-b p-4 flex items-center gap-4 sticky top-0 z-10">
          <Link href="/orders" passHref>
            <Button variant="ghost" size="icon" aria-label="Zurück zur Auftragsliste">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold font-headline">Auftrag AU-12345</h1>
            <p className="text-sm text-muted-foreground">Kunde: Max Mustermann</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto space-y-6">

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notizen & Auftragsdetails</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Notizen zum Auftrag, Besonderheiten, durchgeführte Arbeiten..." rows={5} />
            </CardContent>
          </Card>
          
           <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Materialverbrauch</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setConsumptionDialogOpen(true)}>
                        <PackagePlus className="mr-2 size-4" />
                        Material buchen
                    </Button>
                </CardHeader>
                <CardContent>
                    {consumedItems.length > 0 ? (
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {consumedItems.map(item => (
                                <li key={item.itemId} className="flex justify-between">
                                    <span>{item.quantityConsumed}x {item.name}</span>
                                    <span>(Art.-Nr. {item.articleNumber})</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Noch kein Material für diesen Auftrag verbraucht.</p>
                    )}
                </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fotos</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Placeholder for images */}
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="size-8 text-muted-foreground" />
                  </div>
                   <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="size-8 text-muted-foreground" />
                  </div>
                   <Button variant="outline" className="aspect-square w-full h-full flex flex-col gap-2 items-center justify-center">
                      <Camera className="size-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Foto hinzufügen</span>
                   </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kundenunterschrift</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-[2/1] bg-card rounded-md overflow-hidden border">
                  <SignatureCanvas 
                      ref={sigPad}
                      penColor='hsl(var(--foreground))'
                      canvasProps={{className: 'w-full h-full'}} 
                  />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" onClick={clearSignature}>
                      <Eraser className="mr-2 size-4" />
                      Löschen
                  </Button>
                  <Button onClick={saveSignature}>
                      <Save className="mr-2 size-4" />
                      Unterschrift speichern
                  </Button>
              </div>
            </CardContent>
          </Card>

        </main>

         <footer className="bg-card border-t p-4 fixed bottom-16 left-0 right-0 z-10 grid grid-cols-2 gap-4">
             <Button variant="outline">
                 <Mail className="mr-2 size-4" />
                 An Kunden senden
             </Button>
             <Button variant="default" onClick={finishOrder}>
                <CheckCircle className="mr-2 size-4"/>
                Auftrag abschließen
            </Button>
        </footer>
      </div>
      {isClient && (
        <ConsumptionDialog
            isOpen={isConsumptionDialogOpen}
            onOpenChange={setConsumptionDialogOpen}
            onSave={handleSaveConsumption}
            items={stockItems}
        />
      )}
    </>
  );
}
