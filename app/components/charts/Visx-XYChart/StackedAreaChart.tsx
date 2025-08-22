import { ChartDataType } from "@/lib/api/types/Snapshots.types";
import { curveCardinal } from "@visx/curve";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import { AreaSeries, AreaStack, Axis, Tooltip, XYChart } from "@visx/xychart";
import React from "react";

export default function StackedAreaChart({ data }: { data: ChartDataType }) {
  if (!data) return null;

  return (
    <ParentSize>
      {({ width, height: parentHeight }) => (
        <XYChart
          width={width}
          height={parentHeight}
          margin={{ top: 5, right: 35, bottom: 25, left: 0 }}
          xScale={{ type: "band" }}
          yScale={{ type: "linear" }}
        >
          <AreaStack offset="diverging" curve={curveCardinal} renderLine={true}>
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

          <Axis key="x" orientation="bottom" numTicks={5} />
          <Axis key="y" orientation={"right"} numTicks={5} />
          <Tooltip
            renderTooltip={({ tooltipData }) => {
              const datum = tooltipData?.nearestDatum?.datum as {
                date: string;
                value: number;
              };
              const vaultKey = tooltipData?.nearestDatum?.key as string;
              return (
                <div>
                  <div>
                    <strong>{vaultKey}</strong>
                  </div>
                  <div>
                    {datum?.date}: {datum?.value}
                  </div>
                </div>
              );
            }}
          />
        </XYChart>
      )}
    </ParentSize>
  );
}
