import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, phone, amount } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Sanitize phone number (Convert 07XX or 01XX to 2547XX / 2541XX)
    let formattedPhone = phone.trim().replace("+", "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = `254${formattedPhone.substring(1)}`
    }

    // 2. Fetch Daraja OAuth Token
    const consumerKey = Deno.env.get('DARAJA_CONSUMER_KEY')!
    const consumerSecret = Deno.env.get('DARAJA_CONSUMER_SECRET')!
    const auth = btoa(`${consumerKey}:${consumerSecret}`)

    const tokenRes = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    )
    const { access_token } = await tokenRes.json()

    // 3. Prepare STK Push Payload
    const passkey = Deno.env.get('DARAJA_PASSKEY')!
    const shortcode = Deno.env.get('DARAJA_SHORTCODE')! // e.g. 174379 for Sandbox
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)
    const password = btoa(`${shortcode}${passkey}${timestamp}`)
    const partyA=Deno.env.get('DARAJA_PARTYA')!

    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesaCallback`

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: partyA,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `Tini-${orderId.slice(-8)}`,
      TransactionDesc: `Tini Trove Order ${orderId}`,
    }

    // 4. Send Request to Daraja
    const stkRes = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPayload),
      }
    )

    const stkData = await stkRes.json()

    const mpesaCheckoutId = stkData.CheckoutRequestID

    if (mpesaCheckoutId) {
      await supabaseAdmin
        .from('orders')
        .update({
          mpesa_checkout_id: mpesaCheckoutId
        })
        .eq('id', orderId)
    }

    return new Response(JSON.stringify(stkData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})