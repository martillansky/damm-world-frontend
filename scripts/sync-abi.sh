#!/bin/bash

# Path to Vault's foundry project
CONTRACTS_PATH="../lagoon-contracts"

# Path to Vault ABI output
VAULT_JSON="$CONTRACTS_PATH/out/Vault.sol/Vault.json"
#SILO_JSON="$CONTRACTS_PATH/out/Silo.sol/Silo.json"
UNDERLYING_TOKEN_JSON="$CONTRACTS_PATH/out/MockToken.sol/MockToken.json"
IERC20_JSON="$CONTRACTS_PATH/out/IERC20.sol/IERC20.json"

# Destination in frontend
DEST_ABI_DIR="./lib/contracts/abis"

DEST_ABI_FILE="$DEST_ABI_DIR/Vault.json"
#DEST_SILO_FILE="$DEST_ABI_DIR/Silo.json"
DEST_UNDERLYING_TOKEN_FILE="$DEST_ABI_DIR/MockToken.json"
DEST_IERC20_FILE="$DEST_ABI_DIR/IERC20.json"

# Ensure output folder exists
mkdir -p "$DEST_ABI_DIR"

# Extract the ABI using jq
jq '.abi' "$VAULT_JSON" > "$DEST_ABI_FILE"
echo "✅ Vault ABI synced to $DEST_ABI_FILE"

#jq '.abi' "$SILO_JSON" > "$DEST_SILO_FILE"
#echo "✅ Silo ABI synced to $DEST_SILO_FILE"

jq '.abi' "$UNDERLYING_TOKEN_JSON" > "$DEST_UNDERLYING_TOKEN_FILE"
echo "✅ UnderlyingToken ABI synced to $DEST_UNDERLYING_TOKEN_FILE"

jq '.abi' "$IERC20_JSON" > "$DEST_IERC20_FILE"
echo "✅ IERC20 ABI synced to $DEST_IERC20_FILE"