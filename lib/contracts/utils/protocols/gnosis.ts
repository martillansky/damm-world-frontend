import { ContractNetworksConfig } from "@safe-global/protocol-kit";
import {
  DeploymentFilter,
  getCreateCallDeployment,
  getFallbackHandlerDeployment,
  getMultiSendCallOnlyDeployment,
  getMultiSendDeployment,
  getProxyFactoryDeployment,
  getSafeSingletonDeployment,
  getSignMessageLibDeployment,
  getSimulateTxAccessorDeployment,
} from "@safe-global/safe-deployments";

export const getContractNetworks = (
  filter: DeploymentFilter
): ContractNetworksConfig => {
  if (!filter.network) {
    throw new Error("Network is not set");
  }

  const safeSingletonDeployment = getSafeSingletonDeployment(filter);

  if (!safeSingletonDeployment) {
    throw new Error(
      `Safe Singleton Deployment not found for network ${filter.network}`
    );
  }

  const safeProxyFactoryDeployment = getProxyFactoryDeployment(filter);

  if (!safeProxyFactoryDeployment) {
    throw new Error(
      `Safe Proxy Factory Deployment not found for network ${filter.network}`
    );
  }

  const multiSendDeployment = getMultiSendDeployment(filter);

  if (!multiSendDeployment) {
    throw new Error(
      `Multi Send Deployment not found for network ${filter.network}`
    );
  }

  const multiSendCallOnlyDeployment = getMultiSendCallOnlyDeployment(filter);

  if (!multiSendCallOnlyDeployment) {
    throw new Error(
      `Multi Send Call Only Deployment not found for network ${filter.network}`
    );
  }

  const fallbackHandlerDeployment = getFallbackHandlerDeployment(filter);

  if (!fallbackHandlerDeployment) {
    throw new Error(
      `Fallback Handler Deployment not found for network ${filter.network}`
    );
  }

  const signMessageLibDeployment = getSignMessageLibDeployment(filter);

  if (!signMessageLibDeployment) {
    throw new Error(
      `Sign Message Lib Deployment not found for network ${filter.network}`
    );
  }

  const createCallDeployment = getCreateCallDeployment(filter);

  if (!createCallDeployment) {
    throw new Error(
      `Create Call Deployment not found for network ${filter.network}`
    );
  }

  const simulateTxAccessorDeployment = getSimulateTxAccessorDeployment(filter);

  if (!simulateTxAccessorDeployment) {
    throw new Error(
      `Simulate Tx Accessor Deployment not found for network ${filter.network}`
    );
  }

  return {
    [filter.network]: {
      safeSingletonAddress: safeSingletonDeployment.defaultAddress,
      safeSingletonAbi: safeSingletonDeployment.abi,
      safeProxyFactoryAddress: safeProxyFactoryDeployment.defaultAddress,
      safeProxyFactoryAbi: safeProxyFactoryDeployment.abi,
      multiSendAddress: multiSendDeployment.defaultAddress,
      multiSendAbi: multiSendDeployment.abi,
      multiSendCallOnlyAddress: multiSendCallOnlyDeployment.defaultAddress,
      multiSendCallOnlyAbi: multiSendCallOnlyDeployment.abi,
      fallbackHandlerAddress: fallbackHandlerDeployment.defaultAddress,
      fallbackHandlerAbi: fallbackHandlerDeployment.abi,
      signMessageLibAddress: signMessageLibDeployment.defaultAddress,
      signMessageLibAbi: signMessageLibDeployment.abi,
      createCallAddress: createCallDeployment.defaultAddress,
      createCallAbi: createCallDeployment.abi,
      simulateTxAccessorAddress: simulateTxAccessorDeployment.defaultAddress,
      simulateTxAccessorAbi: simulateTxAccessorDeployment.abi,
      safeWebAuthnSignerFactoryAddress: "0x",
      safeWebAuthnSignerFactoryAbi: [],
      safeWebAuthnSharedSignerAddress: "0x",
      safeWebAuthnSharedSignerAbi: [],
    },
  };
};
