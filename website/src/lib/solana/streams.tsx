import * as React from 'react'

import { web3 } from '@coral-xyz/anchor'
import { BN_ZERO, Stream, SuperstreamClient } from '@superstream/client'

import { DEFAULT_STREAM_SORT } from '@/lib/solana/stream'
import { useSuperstreamClient } from '@/lib/solana/superstream'

async function fetchStreams(client: SuperstreamClient): Promise<Stream[]> {
  const publicKey = client.getWalletPublicKey()
  const [streams, streamsOther] = await Promise.all([
    client.getAllStreams({ sender: publicKey }),
    client.getAllStreams({ recipient: publicKey }),
  ])

  const seen = new Set(streams.map((s) => s.publicKey.toString()))
  streamsOther.forEach((s) => {
    if (!seen.has(s.publicKey.toString())) {
      seen.add(s.publicKey.toString())
      streams.push(s)
    }
  })

  streams.sort(DEFAULT_STREAM_SORT)
  return streams
}

async function fetchStream(client: SuperstreamClient, publicKey: web3.PublicKey): Promise<Stream | undefined> {
  return (await client.getStream(publicKey)) || undefined
}

export type StreamsContextValue = {
  isLoading: boolean
  streams: Stream[]
  error: string
  refresh: () => Promise<void>
  refreshSingle: (stream: Stream) => Promise<void>
}

const StreamsContext = React.createContext({} as StreamsContextValue)

export type StreamsProviderProps = {
  children: React.ReactNode
}

export function StreamsProvider({ children }: StreamsProviderProps) {
  const client = useSuperstreamClient()

  const [state, setState] = React.useState<Omit<StreamsContextValue, 'refresh' | 'refreshSingle'>>({
    isLoading: true,
    streams: [],
    error: '',
  })

  const loadStreams = React.useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: '',
      at: BN_ZERO,
    }))

    if (!client) {
      return
    }

    try {
      const streams = await fetchStreams(client)
      setState({
        streams,
        isLoading: false,
        error: '',
      })
    } catch (e) {
      console.error('Unable to load streams', e)
      setState({
        isLoading: false,
        streams: [],
        error: `Unable to load streams${e instanceof Error ? `: ${e.message}` : ''}`,
      })
    }
  }, [client])

  React.useEffect(() => {
    void loadStreams()
  }, [loadStreams])

  const refreshSingle = React.useCallback(
    async (stream: Stream) => {
      if (!client) {
        return
      }

      const newStream = await fetchStream(client, stream.publicKey)
      setState(({ streams, ...rest }) => {
        const idx = streams.findIndex((s) => s.publicKey.equals(stream.publicKey))
        if (idx < 0) {
          return { streams, ...rest }
        }

        const newStreams = newStream
          ? [...streams.slice(0, idx), newStream, ...streams.slice(idx + 1)]
          : [...streams.slice(0, idx), ...streams.slice(idx + 1)]
        return {
          streams: newStreams,
          ...rest,
        }
      })
    },
    [client],
  )

  const refresh = React.useCallback(async () => {
    await loadStreams()
  }, [loadStreams])

  const value = React.useMemo(() => ({ ...state, refresh, refreshSingle }), [state, refresh, refreshSingle])

  return <StreamsContext.Provider value={value}>{children}</StreamsContext.Provider>
}

export function useStreamsContext(): StreamsContextValue {
  return React.useContext(StreamsContext)
}
