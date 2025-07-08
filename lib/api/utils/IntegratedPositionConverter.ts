import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { IntegratedDataResponse } from "../types/VaultData.types";

export type IntegratedPosition = {
  vault_id: string;
  latest_tvl: number;
  tvl_12h_ago: number;
  latest_apy: number;
  apy_12h_ago: number;
  share_price: number;
  deposit_value: number;
  withdrawal_value: number;
  position_value: number;
  user_total_shares: number;
  total_shares: number;
  completed_deposits: number;
  settled_redeems: number;
  completed_redeems: number;
};

export function getNullMockedIntegratedPosition(): {
  positions: IntegratedPosition[];
} {
  return {
    positions: [
      {
        vault_id: "",
        latest_tvl: 0,
        tvl_12h_ago: 0,
        latest_apy: 0,
        apy_12h_ago: 0,
        share_price: 0,
        deposit_value: 0,
        withdrawal_value: 0,
        position_value: 0,
        user_total_shares: 0,
        total_shares: 0,
        completed_deposits: 0,
        settled_redeems: 0,
        completed_redeems: 0,
      },
    ],
  };
}

function computeAvailableToRedeem(
  settledRedeems: number,
  decimals: number
): number {
  // TODO: check if this is correct. Should we use the share price?
  return Number(
    formatUnits(BigNumber.from(settledRedeems.toString()), decimals)
  );
}

function computeClaimableSharesFromRaw(
  completedDeposits: number, // e.g. 1000000 USDC
  sharePriceFixed: BigNumber, // e.g. 9.99999e-13
  completedRedeems: number, // e.g. 999999 (in 18 decimals)
  decimals: number
): number {
  const deposits = BigNumber.from(completedDeposits.toString());
  const redeems = BigNumber.from(completedRedeems.toString());

  const sharesFromDeposits = sharePriceFixed.gt(0)
    ? deposits
        .mul(BigNumber.from(10).pow(decimals)) // scale to 18 decimals
        .div(sharePriceFixed)
    : BigNumber.from(0);

  let rawOutput = sharesFromDeposits.sub(redeems);
  if (rawOutput.lt(0)) {
    rawOutput = BigNumber.from(0);
  }

  return Number(formatUnits(rawOutput, decimals));
}

export function convertIntegratedPosition(
  response: { positions: IntegratedPosition[] },
  sharesInWallet: number | null = null,
  decimals: number = 18,
  wldUsdPrice: number = 1, // hardcoded or fetched elsewhere
  wldBalance: number | null = null,
  usdcBalance: number | null = null
): IntegratedDataResponse {
  const p = response.positions[0];

  const tvlChangePct =
    p.tvl_12h_ago > 0
      ? ((p.latest_tvl - p.tvl_12h_ago) / p.tvl_12h_ago) * 100
      : 0;

  const apyChangePct = p.latest_apy - p.apy_12h_ago;

  const valueGainedWLD =
    p.position_value - (p.deposit_value - p.withdrawal_value);
  const valueGainedUSD = valueGainedWLD * wldUsdPrice;

  const vaultSharePct =
    p.total_shares > 0
      ? ((p.user_total_shares - p.settled_redeems) / p.total_shares) * 100
      : 0;

  // Convert scientific notation to fixed decimal string
  const sharePriceStr = Number(p.share_price).toFixed(decimals);
  const sharePriceFixed = parseUnits(sharePriceStr, decimals);

  const availableToRedeemWLD = computeAvailableToRedeem(
    p.settled_redeems,
    decimals
  );

  const claimableShares = computeClaimableSharesFromRaw(
    p.completed_deposits,
    sharePriceFixed,
    p.completed_redeems,
    decimals
  );

  const formattedPositionValue = p.position_value / 10 ** decimals;

  return {
    vaultData: {
      tvl: p.latest_tvl / 10 ** decimals,
      tvlChange: tvlChangePct,
      apr: p.latest_apy,
      aprChange: apyChangePct,
      valueGained: valueGainedWLD,
      valueGainedUSD,
      position: formattedPositionValue,
      positionUSD: formattedPositionValue * wldUsdPrice,
    },
    positionData: {
      totalValue: formattedPositionValue,
      totalValueUSD: formattedPositionValue * wldUsdPrice,
      availableToRedeem: availableToRedeemWLD,
      availableToRedeemUSD: availableToRedeemWLD * wldUsdPrice,
      claimableShares: claimableShares,
      vaultShare: vaultSharePct,
      sharesInWallet: sharesInWallet || 0,
      wldBalance: wldBalance || 0,
      usdcBalance: usdcBalance || 0,
    },
  };
}
