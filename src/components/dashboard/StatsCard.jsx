import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const colorClasses = {
  green: {
    bg: "from-emerald-500 to-teal-600",
    icon: "bg-emerald-100 text-emerald-600",
    iconDark: "bg-emerald-900/50 text-emerald-400"
  },
  blue: {
    bg: "from-blue-500 to-indigo-600", 
    icon: "bg-blue-100 text-blue-600",
    iconDark: "bg-blue-900/50 text-blue-400"
  },
  orange: {
    bg: "from-orange-500 to-red-600",
    icon: "bg-orange-100 text-orange-600",
    iconDark: "bg-orange-900/50 text-orange-400"
  },
  purple: {
    bg: "from-purple-500 to-pink-600",
    icon: "bg-purple-100 text-purple-600",
    iconDark: "bg-purple-900/50 text-purple-400"
  }
};

export default function StatsCard({ title, value, icon: Icon, trend, color = "blue", darkMode = false }) {
  const colors = colorClasses[color];
  
  return (
    <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800/90 backdrop-blur-sm' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gradient-to-br ${colors.bg} rounded-full opacity-10`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-slate-500'
            }`}>{title}</p>
            <p className={`text-3xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${
            darkMode ? colors.iconDark : colors.icon
          }`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-sm transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-slate-600'
          }`}>
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}