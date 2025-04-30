/**
 * Client-side wrapper for Alchemy SDK that uses our secure proxy
 */

type AlchemyRequest = {
  method: string
  params?: any[]
}

class AlchemyClient {
  /**
   * Core namespace contains methods for interacting with Ethereum blockchain data
   */
  core = {
    getBlock: async (blockNumber: number | string) => {
      return this.sendRequest({
        method: "getBlock",
        params: [blockNumber],
      })
    },

    getBlockNumber: async () => {
      return this.sendRequest({
        method: "getBlockNumber",
        params: [],
      })
    },

    getBalance: async (address: string) => {
      return this.sendRequest({
        method: "getBalance",
        params: [address],
      })
    },

    getTokenBalances: async (address: string) => {
      return this.sendRequest({
        method: "getTokenBalances",
        params: [address],
      })
    },

    getAssetTransfers: async (params: any) => {
      return this.sendRequest({
        method: "getAssetTransfers",
        params: [params],
      })
    },

    getTransaction: async (txHash: string) => {
      return this.sendRequest({
        method: "getTransaction",
        params: [txHash],
      })
    },

    getTransactionReceipt: async (txHash: string) => {
      return this.sendRequest({
        method: "getTransactionReceipt",
        params: [txHash],
      })
    },

    // Add more methods as needed
  }

  /**
   * Send request to our Alchemy proxy API
   */
  private async sendRequest(request: AlchemyRequest) {
    try {
      const response = await fetch("/api/alchemy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return data.result
    } catch (error) {
      console.error("Alchemy client error:", error)
      throw error
    }
  }
}

// Export a singleton instance
export const alchemy = new AlchemyClient()
