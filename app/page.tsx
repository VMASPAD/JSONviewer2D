"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JSONData from "./components/JSON";
import Viewer from "./components/Viewer";
import Tree from "./components/Tree";
import Canvas from "./components/Canvas";
import { toast } from "sonner"
import { Input } from "@/components/ui/input";

export default function Home() {
  const handleNodeClick = (event, nodeData) => {
    const inputSelectData = (document.getElementById("inputSelectData") as HTMLInputElement).value;
    console.log('Input seleccionado:', inputSelectData);
    console.log('Ruta completa:', nodeData.fullPath);
    console.log('Datos completos:', nodeData.data);
  
    // Función auxiliar para acceder de forma segura a propiedades anidadas
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : undefined;
      }, obj);
    };
  
    // Obtener el valor específico basado en el input del usuario
    const specificValue = getNestedValue(nodeData.data, inputSelectData);
  
    toast.success(`Route: ${nodeData.fullPath}`, {
      description: specificValue !== undefined 
        ? `Valor de ${inputSelectData}: ${JSON.stringify(specificValue)}`
        : `No se encontró el valor para ${inputSelectData}`
    });
  };
  
  return (
    <>
    <Tabs defaultValue="account" className="w-screen">
  <TabsList className="flex flex-row">
    <TabsTrigger value="Canvas">Canvas</TabsTrigger>
    <TabsTrigger value="Viewer">Viewer</TabsTrigger>
    <TabsTrigger value="JSON">JSON</TabsTrigger>
    <TabsTrigger value="Tree">Tree</TabsTrigger>
  </TabsList>
  <TabsContent value="Tree"><Tree /></TabsContent>
  <TabsContent value="Viewer"><Viewer /></TabsContent>
  <TabsContent value="Canvas"><Canvas onNodeClick={handleNodeClick}/> <br /><Input id="inputSelectData" placeholder="Data Especific"/> <p>See the console log (F12) all data</p></TabsContent>
  <TabsContent value="JSON"><JSONData /></TabsContent>
</Tabs>

    </>
  );
}
