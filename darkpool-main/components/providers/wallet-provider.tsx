"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface WalletContextType {
  address: string | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signAndSubmitTransaction: (payload: any) => Promise<any>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const { toast } = useToast()

  // Check if Petra wallet is installed
  const getAptosWallet = useCallback(() => {
    if (typeof window !== "undefined") {
      return (window as any).aptos || (window as any).petra
    }
    return null
  }, [])

  // Check existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const wallet = getAptosWallet()
      if (wallet) {
        try {
          const response = await wallet.account()
          if (response?.address) {
            setAddress(response.address)
            setConnected(true)
          }
        } catch (error) {
          // Not connected
        }
      }
    }
    checkConnection()
  }, [getAptosWallet])

  // Listen for account changes
  useEffect(() => {
    const wallet = getAptosWallet()
    if (wallet) {
      const handleAccountChange = (newAccount: any) => {
        if (newAccount?.address) {
          setAddress(newAccount.address)
          setConnected(true)
        } else {
          setAddress(null)
          setConnected(false)
        }
      }

      wallet.onAccountChange?.(handleAccountChange)
    }
  }, [getAptosWallet])

  const connect = async () => {
    const wallet = getAptosWallet()

    if (!wallet) {
      toast({
        title: "Wallet not found",
        description: "Please install Petra or Martian wallet",
        variant: "destructive",
      })
      window.open("https://petra.app/", "_blank")
      return
    }

    setConnecting(true)
    try {
      const response = await wallet.connect()
      setAddress(response.address)
      setConnected(true)
      toast({
        title: "Connected",
        description: "Wallet connected successfully",
      })
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    const wallet = getAptosWallet()
    if (wallet) {
      wallet.disconnect?.()
    }
    setAddress(null)
    setConnected(false)
    toast({
      title: "Disconnected",
      description: "Wallet disconnected",
    })
  }

  const signAndSubmitTransaction = async (payload: any) => {
    const wallet = getAptosWallet()
    if (!wallet || !connected) {
      throw new Error("Wallet not connected")
    }

    const response = await wallet.signAndSubmitTransaction(payload)
    return response
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        connected,
        connecting,
        connect,
        disconnect,
        signAndSubmitTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
