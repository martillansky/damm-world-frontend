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
              setTooltip({
                x: e.clientX,
                y: e.clientY,
                content: datum.date,
                vaultKey: datum.label,
                value: datum.value,
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
              {Object.entries(data).map(([vaultId, data]) => (
                <AreaSeries
                  key={vaultId}
                  dataKey={vaultId}
                  data={data}
                  xAccessor={(d: { date: string; value: number }) => d.date}
                  yAccessor={(d: { date: string; value: number }) => d.value}
                  curve={curveCardinal}
                  fillOpacity={0.2}
                />
              ))}
            </AreaStack>

            <Axis key="x" orientation="bottom" numTicks={2} />
            <Axis key="y" orientation={"right"} numTicks={5} />
          </XYChart>

          {/* Custom Tooltip Portal */}
          {tooltip &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="fixed bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-2 shadow-lg pointer-events-none"
                style={{
                  zIndex: 999999,
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="text-muted-light dark:text-muted">
                  <strong>{tooltip.vaultKey}</strong>
                </div>
                <div className="text-muted-light dark:text-muted">
                  {tooltip.content}: {tooltip.value}
                </div>
              </div>,
              document.body
            )}
        </div>
      )}
    </ParentSize>
  );
}
