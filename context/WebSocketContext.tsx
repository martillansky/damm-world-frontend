"use client";

import { getSigner } from "@/lib/contracts/utils/utils";
import { getEnvVars } from "@/lib/utils/env";
import { randomBytes } from "crypto";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAccount } from "wagmi";

export interface WebSocketMessage {
  type?: string;
  data?: unknown;
  timestamp?: string;
  [key: string]: unknown;
}

interface WebSocketContextValue {
  latestPublicMessage: WebSocketMessage | null;
  latestPrivateMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [latestPublicMessage, setLatestPublicMessage] =
    useState<WebSocketMessage | null>(null);
  const [latestPrivateMessage, setLatestPrivateMessage] =
    useState<WebSocketMessage | null>(null);

  const publicSocketRef = useRef<WebSocket | null>(null);
  const privateSocketRef = useRef<WebSocket | null>(null);

  const WEB_SOCKET_GATEWAY = getEnvVars().WEB_SOCKET_GATEWAY;
  const publicWsEndpoint = `${WEB_SOCKET_GATEWAY}/ws/updates`;
  const privateWsEndpoint = `${WEB_SOCKET_GATEWAY}/ws/private`;

  const { address } = useAccount();

  // PUBLIC WS
  useEffect(() => {
    console.log("Public WS endpoint:", publicWsEndpoint);
    const socket = new WebSocket(publicWsEndpoint);
    publicSocketRef.current = socket;

    socket.onopen = () => {
      console.log("[Public WS] connection established");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("[Public WS] Update received:", data);
      setLatestPublicMessage(data);
    };

    socket.onerror = (error) => {
      console.error("[Public WS] error:", error);
    };

    socket.onclose = () => {
      console.log("[Public WS] connection closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  // PRIVATE WS
  useEffect(() => {
    if (!address) return; // wait for wallet connection

    console.log("Private WS endpoint:", privateWsEndpoint);
    const socket = new WebSocket(privateWsEndpoint);
    privateSocketRef.current = socket;

    socket.onopen = async () => {
      console.log("[Private WS] connection established");

      try {
        const nonce = randomBytes(16).toString("hex"); // secure random nonce
        const signer = await getSigner();
        const signature = await signer.signMessage(nonce);

        socket.send(
          JSON.stringify({
            wallet: address,
            signature,
            nonce,
          })
        );

        console.log("[Private WS] Auth message sent with nonce:", nonce);
      } catch (e) {
        console.error("[Private WS] Failed to sign auth message:", e);
        socket.close();
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("[Private WS] Update received:", data);
      setLatestPrivateMessage(data);
    };

    socket.onerror = (error) => {
      console.error("[Private WS] error:", error);
    };

    socket.onclose = () => {
      console.log("[Private WS] connection closed");
    };

    return () => {
      socket.close();
    };
  }, [address]); // re-run if wallet address changes

  return (
    <WebSocketContext.Provider
      value={{ latestPublicMessage, latestPrivateMessage }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
