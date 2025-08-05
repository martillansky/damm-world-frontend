import { curveCardinal } from "@visx/curve";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import { AreaSeries, AreaStack, Axis, Tooltip, XYChart } from "@visx/xychart";
import React from "react";
import { data, DataPoint } from "./MockData";

export default function StackedAreaChart() {
  return (
    <ParentSize>
      {({ width, height: parentHeight }) => (
        <XYChart
          width={width}
          height={parentHeight}
          margin={{ top: 5, right: 0, bottom: 25, left: 15 }}
          xScale={{ type: "band" }}
          yScale={{ type: "linear" }}
        >
          <AreaStack offset="expand" curve={curveCardinal} renderLine={true}>
            {data.map((vaultData) => (
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

          <Axis orientation="bottom" numTicks={5} />
          <Axis label={"APY"} orientation={"left"} numTicks={5} />
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
