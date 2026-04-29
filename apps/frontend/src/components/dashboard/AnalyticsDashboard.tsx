"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ArrowUpRight, ArrowDownRight, Users, Eye, MousePointerClick, Share2 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useConfigStore } from '@/store/useConfigStore';
import { apiGet } from '@/lib/api-client';

interface AnalyticsPoint {
  name: string;
  views: number;
  clicks: number;
  shares: number;
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<AnalyticsPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { organizationId } = useConfigStore();

  React.useEffect(() => {
    setIsLoading(true);
    apiGet<{ success: boolean; data: AnalyticsPoint[] }>(`/api/analytics?organizationId=${organizationId}&timeRange=${timeRange}`)
      .then(result => {
        if (result.success && result.data.length > 0) {
          setData(result.data);
        } else {
          setData([{ name: 'Sin datos', views: 0, clicks: 0, shares: 0 }]);
        }
      })
      .catch(err => {
        console.error('Error fetching analytics:', err);
        setData([{ name: 'Sin datos', views: 0, clicks: 0, shares: 0 }]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [organizationId, timeRange]);

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#8E8E93]">Impresiones Totales</p>
                <p className="text-3xl font-bold text-white">24.5K</p>
              </div>
              <div className="p-2 bg-[#2C2C2E] rounded-md">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-emerald-400 mr-1" />
              <span className="text-emerald-400 font-medium">12%</span>
              <span className="text-[#8E8E93] ml-2">vs periodo anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#8E8E93]">Engagement Rate</p>
                <p className="text-3xl font-bold text-white">4.2%</p>
              </div>
              <div className="p-2 bg-[#2C2C2E] rounded-md">
                <MousePointerClick className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-emerald-400 mr-1" />
              <span className="text-emerald-400 font-medium">0.8%</span>
              <span className="text-[#8E8E93] ml-2">vs periodo anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#8E8E93]">Nuevos Seguidores</p>
                <p className="text-3xl font-bold text-white">+840</p>
              </div>
              <div className="p-2 bg-[#2C2C2E] rounded-md">
                <Users className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowDownRight className="w-4 h-4 text-red-400 mr-1" />
              <span className="text-red-400 font-medium">3%</span>
              <span className="text-[#8E8E93] ml-2">vs periodo anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#8E8E93]">Viralidad (Shares)</p>
                <p className="text-3xl font-bold text-white">1.2K</p>
              </div>
              <div className="p-2 bg-[#2C2C2E] rounded-md">
                <Share2 className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-emerald-400 mr-1" />
              <span className="text-emerald-400 font-medium">18%</span>
              <span className="text-[#8E8E93] ml-2">vs periodo anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium text-white">Rendimiento de Audiencia (Real-Time DB)</CardTitle>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">Cargando métricas...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#8E8E93" />
                  <YAxis stroke="#8E8E93" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="views" name="Impresiones" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="clicks" name="Interacciones" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
