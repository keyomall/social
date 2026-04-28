"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, RefreshCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CampaignTracker() {
  const [filter, setFilter] = useState("ALL");

  const allPosts = [
    { id: '1', content: 'Lanzamiento del producto X', platform: 'LinkedIn', status: 'PUBLISHED', date: 'Hace 5 min' },
    { id: '2', content: 'Visión AuraSync', platform: 'Twitter (X)', status: 'SCHEDULED', date: 'En Cola' },
    { id: '3', content: 'Campaña Visual (TikTok)', platform: 'TikTok', status: 'FAILED', date: 'Hace 1 hora', error: 'Falta Video' },
    { id: '4', content: 'Noticia corporativa Q3', platform: 'Facebook', status: 'PUBLISHED', date: 'Hace 2 horas' },
  ];

  const posts = filter === "ALL" ? allPosts : allPosts.filter(p => p.status === filter);

  return (
    <Card className="shadow-sm border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Historial de Campañas</span>
          <div className="flex gap-2">
            <div className="flex bg-background border border-border/50 rounded-md p-1 mr-4">
               <button onClick={() => setFilter("ALL")} className={`text-xs px-2 py-1 rounded ${filter === 'ALL' ? 'bg-muted' : ''}`}>Todo</button>
               <button onClick={() => setFilter("PUBLISHED")} className={`text-xs px-2 py-1 rounded ${filter === 'PUBLISHED' ? 'bg-muted' : ''}`}>Publicados</button>
               <button onClick={() => setFilter("FAILED")} className={`text-xs px-2 py-1 rounded ${filter === 'FAILED' ? 'bg-muted' : ''}`}>Fallidos</button>
            </div>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground">
              <RefreshCcw className="w-3 h-3" />
              Actualizar
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Audita en tiempo real el estatus de la Smart Queue y de las APIs sociales. Utiliza los filtros para aislar errores.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Contenido Semilla</TableHead>
                <TableHead>Red Social</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead className="text-right">Tiempo / Log</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{post.content}</TableCell>
                  <TableCell>{post.platform}</TableCell>
                  <TableCell>
                    {post.status === 'PUBLISHED' && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1"/> Publicado</Badge>}
                    {post.status === 'SCHEDULED' && <Badge variant="outline" className="bg-blue-500/10 text-blue-500"><Clock className="w-3 h-3 mr-1"/> En Cola</Badge>}
                    {post.status === 'FAILED' && <Badge variant="outline" className="bg-red-500/10 text-red-500"><AlertCircle className="w-3 h-3 mr-1"/> Fallido</Badge>}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {post.status === 'FAILED' ? <span className="text-red-400">{post.error}</span> : post.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
