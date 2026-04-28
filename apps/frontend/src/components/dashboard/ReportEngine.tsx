"use client";
import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileBarChart, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function ReportEngine() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const data = [
    { name: "Facebook", engagement: 4.2, reach: 12 },
    { name: "LinkedIn", engagement: 8.1, reach: 3 },
    { name: "Twitter", engagement: 2.5, reach: 45 },
    { name: "Instagram", engagement: 6.8, reach: 25 },
  ];

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("AuraSync_Reporte_Ejecutivo.pdf");
    } catch (error) {
      console.error("Error al exportar el PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="shadow-sm border-border/50 bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-indigo-500" />
            Reportes Ejecutivos
          </CardTitle>
          <CardDescription>Genera informes en PDF o DOCX con gráficas, métricas cruzadas y diagnósticos de la IA para tus clientes o jefes.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} disabled={isExporting} variant="default" className="bg-indigo-600 hover:bg-indigo-700">
            {isExporting ? <span className="animate-pulse">Exportando...</span> : <><Download className="w-4 h-4 mr-2" /> PDF Profesional</>}
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10">
            <FileText className="w-4 h-4 mr-2" /> DOCX
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Este es el contenedor que se capturará para el PDF */}
        <div ref={reportRef} className="p-8 bg-white text-black rounded-lg border border-slate-200">
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900">AuraSync</h1>
              <p className="text-sm font-semibold tracking-widest text-slate-500 uppercase mt-1">Reporte Ejecutivo de Rendimiento</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Fecha: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-slate-500">Periodo: Últimos 30 días</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">1. Resumen de Impacto (Generado por IA)</h2>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm leading-relaxed">
                Durante este periodo, el <b>Motor Generativo</b> ha ejecutado <span className="font-bold">45 publicaciones</span> a través de 4 redes. 
                Se detecta que <b>LinkedIn</b> es el canal más valioso, aportando un engagement promedio del <b>8.1%</b> (el doble que Facebook), 
                mientras que <b>Twitter</b> se mantiene como la red reina para el alcance puro (45K impresiones).
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">2. Comparativa de Redes (Métricas Duras)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                  <Bar dataKey="reach" name="Alcance (K)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="engagement" name="Engagement (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
            <p>Generado automáticamente por AuraSync V6 - The AI Publishing Engine</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
