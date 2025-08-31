import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const colorClasses = {
  green: {
    bg: "from-emerald-500 to-teal-600",
    icon: "bg-emerald-100 text-emerald-600"
  },
  blue: {
    bg: "from-blue-500 to-indigo-600", 
    icon: "bg-blue-100 text-blue-600"
  },
  orange: {
    bg: "from-orange-500 to-red-600",
    icon: "bg-orange-100 text-orange-600"
  },
  purple: {
    bg: "from-purple-500 to-pink-600",
    icon: "bg-purple-100 text-purple-600"
  }
};

export default function StatsCard({ title, value, icon: Icon, trend, color = "blue" }) {
  const colors = colorClasses[color];
  
  return (
    <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gradient-to-br ${colors.bg} rounded-full opacity-10`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colors.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center text-sm text-slate-600">
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}