import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { wallet } = await req.json() as { wallet: string }
  const apiKey = process.env.HELIUS_API_KEY!

  const url = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${apiKey}&type=SWAP&limit=5`
  const res = await fetch(url)
  const data = await res.json()

  // Return just the first transaction's structure so we can see the shape
  const first = Array.isArray(data) && data.length > 0 ? data[0] : data
  return NextResponse.json({
    total: Array.isArray(data) ? data.length : 0,
    feePayer: first?.feePayer,
    type: first?.type,
    source: first?.source,
    hasEvents: !!first?.events,
    hasSwap: !!first?.events?.swap,
    nativeInput: first?.events?.swap?.nativeInput,
    nativeOutput: first?.events?.swap?.nativeOutput,
    tokenInputsCount: first?.events?.swap?.tokenInputs?.length,
    tokenOutputsCount: first?.events?.swap?.tokenOutputs?.length,
    innerSwapsCount: first?.events?.swap?.innerSwaps?.length,
    firstTokenOutput: first?.events?.swap?.tokenOutputs?.[0],
    firstTokenInput: first?.events?.swap?.tokenInputs?.[0],
  })
}
