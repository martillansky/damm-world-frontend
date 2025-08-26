import { ChartDataType } from "@/lib/api/types/Snapshots.types";
import { curveCardinal } from "@visx/curve";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import { AreaSeries, AreaStack, Axis, XYChart } from "@visx/xychart";
import React, { useState } from "react";
import { createPortal } from "react-dom";

export default function StackedAreaChart({ data }: { data: ChartDataType }) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
    vaultKey: string;
    value: number;
    chartX: number;
  } | null>(null);

  if (!data) return null;

  return (
    <ParentSize>
      {({ width, height: parentHeight }) => (
        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;

            // Find the nearest data point
            const allData = Object.entries(data).flatMap(
              ([vaultId, vaultData]) =>
                vaultData.map((d) => ({ ...d, vaultId, label: d.label }))
            );

            if (allData.length > 0) {
              const index = Math.floor((x / width) * allData.length);
              const datum = allData[Math.min(index, allData.length - 1)];

              // Adjust X position to align with the chart area
              const chartX = x - 22; // Move line much further to the left

              setTooltip({
                x: e.clientX,
                y: e.clientY,
                content: datum.date,
                vaultKey: datum.label,
                value: datum.value,
                chartX: chartX,
              });
            }
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <XYChart
            width={width}
            height={parentHeight}
            margin={{ top: 5, right: 35, bottom: 25, left: 0 }}
            xScale={{ type: "band" }}
            yScale={{ type: "linear" }}
          >
            <AreaStack
              offset="diverging"
              curve={curveCardinal}
              renderLine={true}
            >
              {Object.entries(data).map(([vaultId, data]) => {
                data.forEach((d) => {
                  let formattedDate;
                  if (d.metric === "hours")
                    formattedDate = new Date(d.date).toLocaleTimeString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );
                  else
                    formattedDate = new Date(d.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    );
                  if (formattedDate !== "Invalid Date") d.date = formattedDate;

                  return d;
                });

                return (
                  <AreaSeries
                    key={vaultId}
                    dataKey={vaultId}
                    data={data}
                    xAccessor={(d: { date: string; value: number }) => d.date}
                    yAccessor={(d: { date: string; value: number }) => d.value}
                    curve={curveCardinal}
                    fillOpacity={0.2}
                  />
                );
              })}
            </AreaStack>

            <Axis key="x" orientation="bottom" numTicks={2} />
            <Axis key="y" orientation={"right"} numTicks={5} />
          </XYChart>

          {/* Custom Tooltip Portal */}
          {tooltip &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="fixed bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-600/50 rounded-lg p-2 shadow-2xl pointer-events-none"
                style={{
                  zIndex: 999999,
                  left: tooltip.x + 15,
                  top: tooltip.y,
                  transform: "translateY(-50%)",
                }}
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {tooltip.vaultKey}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {tooltip.content}
                  </div>
                  <div className="text-sm font-medium text-lime-400">
                    {tooltip.value !== null && tooltip.value !== undefined
                      ? tooltip.value.toFixed(2)
                      : "0.00"}
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* Vertical Reference Line */}
          {tooltip && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: tooltip.chartX,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: "rgba(163, 230, 53, 0.6)",
                zIndex: 999998,
              }}
            />
          )}
        </div>
      )}
    </ParentSize>
  );
}
