import { curveCardinal } from "@visx/curve";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import { AreaSeries, AreaStack, Axis, Tooltip, XYChart } from "@visx/xychart";
import React from "react";
import { data, DataPoint } from "./MockData";

export default function StackedAreaChart({ vaultName }: { vaultName: string }) {
  const filteredData =
    vaultName === "all"
      ? data
      : data.filter((vaultData) => vaultData.vault === vaultName);
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
            {filteredData.map((vaultData) => (
              <AreaSeries
                key={vaultData.vault}
                dataKey={vaultData.vault}
                data={vaultData.data}
                xAccessor={(d: DataPoint) => d.date}
                yAccessor={(d: DataPoint) => d.value}
                curve={curveCardinal}
                fillOpacity={0.2}
              />
            ))}
          </AreaStack>

          <Axis key="x" orientation="bottom" numTicks={5} />
          <Axis key="y" orientation={"right"} numTicks={5} />
          <Tooltip
            renderTooltip={({ tooltipData }) => {
              const datum = tooltipData?.nearestDatum?.datum as DataPoint;
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
