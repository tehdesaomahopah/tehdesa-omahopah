
import React from "react";
import { BarChart as RechartsBarChart, LineChart as RechartsLineChart, PieChart as RechartsPieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export const BarChart = ({ data, dataKey, fill = "#8884d8" }: { data: any[]; dataKey: string; fill?: string }) => {
  return (
    <ChartContainer 
      config={{
        [dataKey]: {
          color: fill
        }
      }} 
      className="h-80 w-full"
    >
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey={dataKey} fill={fill} />
      </RechartsBarChart>
    </ChartContainer>
  );
};

export const LineChart = ({ 
  data, 
  dataKey, 
  stroke = "#8884d8", 
  dataKey2, 
  stroke2 
}: { 
  data: any[]; 
  dataKey: string; 
  stroke?: string; 
  dataKey2?: string; 
  stroke2?: string 
}) => {
  return (
    <ChartContainer 
      config={{
        [dataKey]: {
          color: stroke
        },
        ...(dataKey2 ? { [dataKey2]: { color: stroke2 } } : {})
      }} 
      className="h-80 w-full"
    >
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey={dataKey} stroke={stroke} activeDot={{ r: 8 }} />
        {dataKey2 && stroke2 && (
          <Line type="monotone" dataKey={dataKey2} stroke={stroke2} />
        )}
      </RechartsLineChart>
    </ChartContainer>
  );
};

export const PieChart = ({ data, dataKey, nameKey }: { data: any[]; dataKey: string; nameKey: string }) => {
  return (
    <ChartContainer 
      config={
        data.reduce((acc, item, index) => {
          acc[item[nameKey]] = { color: COLORS[index % COLORS.length] };
          return acc;
        }, {} as Record<string, { color: string }>)
      } 
      className="h-80 w-full"
    >
      <RechartsPieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
};
