
import React from "react";
import { BarChart as RechartsBarChart, LineChart as RechartsLineChart, PieChart as RechartsPieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export const BarChart = ({ 
  data, 
  dataKeys = [], 
  colors = ["#10b981", "#3b82f6", "#8b5cf6"], 
  fill = "#8884d8" 
}: { 
  data: any[]; 
  dataKeys?: string[];
  colors?: string[];
  fill?: string;
}) => {
  // If only a single dataKey is passed via the old API, convert it to array format
  const dataKeysArray = dataKeys.length > 0 ? dataKeys : [fill];
  const colorsArray = colors || ["#10b981", "#3b82f6", "#8b5cf6"];
  
  // Create config for the ChartContainer
  const config = dataKeysArray.reduce((acc, key, index) => {
    acc[key] = { color: colorsArray[index % colorsArray.length] };
    return acc;
  }, {} as Record<string, { color: string }>);
  
  return (
    <ChartContainer 
      config={config} 
      className="h-80 w-full"
    >
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          height={60}
          tickMargin={10}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        {dataKeysArray.map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key} 
            fill={colorsArray[index % colorsArray.length]} 
            // Hide name since it's already in the legend/tooltip
            name={key}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
};

export const LineChart = ({ 
  data, 
  dataKey, 
  stroke = "#8884d8", 
  dataKey2, 
  stroke2,
  lineType = "monotone",
  dotSize = 8,
  hideGrid = false,
  yAxisFormatter
}: { 
  data: any[]; 
  dataKey: string; 
  stroke?: string; 
  dataKey2?: string; 
  stroke2?: string;
  lineType?: "monotone" | "basis" | "linear" | "natural" | "step" | "stepBefore" | "stepAfter";
  dotSize?: number;
  hideGrid?: boolean;
  yAxisFormatter?: (value: number) => string;
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
        {!hideGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          height={60}
          tickMargin={10}
        />
        <YAxis 
          tickFormatter={yAxisFormatter}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Line 
          type={lineType} 
          dataKey={dataKey} 
          stroke={stroke} 
          activeDot={{ r: dotSize }}
          strokeWidth={2}
        />
        {dataKey2 && stroke2 && (
          <Line 
            type={lineType} 
            dataKey={dataKey2} 
            stroke={stroke2}
            strokeWidth={2} 
          />
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
        <Legend />
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
      </RechartsPieChart>
    </ChartContainer>
  );
};
