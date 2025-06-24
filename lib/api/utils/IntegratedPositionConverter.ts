import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { IntegratedDataResponse } from "../types/VaultData.types";

type IntegratedPosition = {
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
  completed_redeems: number;
};

function computeAvailableToRedeemFromRaw(
  sharePriceBN: BigNumber,
  completedRedeems: number
): number {
  const completedRedeemsBN = BigNumber.from(completedRedeems.toString());
  //const sharePriceBN = parseUnits(sharePrice.toString(), 18);

  const availableToRedeemBN = completedRedeemsBN
    .mul(sharePriceBN)
    .div(parseUnits("1", 18));

  const availableToRedeemWLD = Number(formatUnits(availableToRedeemBN, 18));
  return availableToRedeemWLD;
}

function computeClaimableSharesFromRaw(
  completedDeposits: number, // e.g. 1000000 USDC
  sharePriceFixed: BigNumber, // e.g. 9.99999e-13
  completedRedeems: number // e.g. 999999 (in 18 decimals)
): number {
  const deposits = BigNumber.from(completedDeposits.toString());
  const redeems = BigNumber.from(completedRedeems.toString());

  const sharesFromDeposits = deposits
    .mul(BigNumber.from("1000000000000000000")) // scale to 18 decimals
    .div(sharePriceFixed);

  const rawOutput = sharesFromDeposits.sub(redeems);
  return Number(formatUnits(rawOutput, 18));
}

export function convertIntegratedPosition(
  response: { positions: IntegratedPosition[] },
  sharesInWallet: number | null = null,
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
    p.total_shares > 0 ? (p.user_total_shares / p.total_shares) * 100 : 0;

  // Convert scientific notation to fixed decimal string
  const sharePriceStr = Number(p.share_price).toFixed(18);
  const sharePriceFixed = parseUnits(sharePriceStr, 18);

  const availableToRedeemWLD = computeAvailableToRedeemFromRaw(
    sharePriceFixed,
    p.completed_redeems
  );

  const claimableShares = computeClaimableSharesFromRaw(
    p.completed_deposits,
    sharePriceFixed,
    p.completed_redeems
  );

  return {
    vaultData: {
      tvl: p.latest_tvl,
      tvlChange: tvlChangePct,
      apr: p.latest_apy,
      aprChange: apyChangePct,
      valueGained: valueGainedWLD,
      valueGainedUSD,
      position: p.position_value,
      positionUSD: p.position_value * wldUsdPrice,
    },
    positionData: {
      totalValue: p.position_value,
      totalValueUSD: p.position_value * wldUsdPrice,
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
