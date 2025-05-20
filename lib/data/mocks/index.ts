import { mockedActivity } from "./mockedActivity";
import { mockedPositionData } from "./mockedPosition";
import { mockedVaultData } from "./mockedVault";

export function getNullMockedVaultData() {
  return {
    vaultData: {},
    positionData: {},
    activityData: [],
  };
}

export function getMockedVaultData() {
  return {
    vaultData: mockedVaultData,
    positionData: mockedPositionData,
    activityData: mockedActivity,
  };
}
