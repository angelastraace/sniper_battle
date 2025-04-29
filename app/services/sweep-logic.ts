// Sweep logic service
import { ethers } from "ethers"

// In-memory storage for private keys (in a real app, this would be more secure)
const privateKeyStore: Record<string, string> = {}

export function addPrivateKey(address: string, privateKey: string): void {
  privateKeyStore[address.toLowerCase()] = privateKey
}

export function hasPrivateKey(address: string): boolean {
  return !!privateKeyStore[address.toLowerCase()]
}

export async function sweepMultipleAddresses(addresses: string[]): Promise<
  Array<{
    address: string
    success: boolean
    txHash: string
    message: string
  }>
> {
  const results = []

  for (const address of addresses) {
    try {
      // Check if we have the private key
      if (!hasPrivateKey(address)) {
        results.push({
          address,
          success: false,
          txHash: "",
          message: "No private key available for this address",
        })
        continue
      }

      // Get the private key
      const privateKey = privateKeyStore[address.toLowerCase()]

      // Create a wallet
      const wallet = new ethers.Wallet(privateKey)

      // Connect to a provider
      const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC || "https://eth-mainnet.public.blastapi.io")
      const connectedWallet = wallet.connect(provider)

      // Get the balance
      const balance = await provider.getBalance(address)

      // If balance is too low, skip
      if (balance < ethers.parseEther("0.001")) {
        results.push({
          address,
          success: false,
          txHash: "",
          message: "Balance too low to sweep (gas costs would exceed balance)",
        })
        continue
      }

      // Calculate gas price and cost
      const feeData = await provider.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits("50", "gwei")
      const gasLimit = 21000 // Standard ETH transfer
      const gasCost = gasPrice * BigInt(gasLimit)

      // Calculate amount to send (balance - gas cost)
      const amountToSend = balance - gasCost

      // If amount is negative or zero, skip
      if (amountToSend <= 0) {
        results.push({
          address,
          success: false,
          txHash: "",
          message: "Balance too low after gas costs",
        })
        continue
      }

      // Get the destination address from environment variables
      const destinationAddress = process.env.DESTINATION_WALLET_ETH || wallet.address

      // Create and send the transaction
      const tx = await connectedWallet.sendTransaction({
        to: destinationAddress,
        value: amountToSend,
        gasLimit,
        gasPrice,
      })

      // Wait for the transaction to be mined
      const receipt = await tx.wait()

      results.push({
        address,
        success: true,
        txHash: receipt?.hash || tx.hash,
        message: `Successfully swept ${ethers.formatEther(amountToSend)} ETH to ${destinationAddress}`,
      })
    } catch (error) {
      results.push({
        address,
        success: false,
        txHash: "",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return results
}
