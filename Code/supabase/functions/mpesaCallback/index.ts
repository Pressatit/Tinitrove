import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"


serve(async (req) => {
  try {
    const body = await req.json()
    const stkCallback = body?.Body?.stkCallback

    if (!stkCallback) {
      return new Response("Invalid payload", { status: 400 })
    }

    const resultCode = stkCallback.ResultCode
    const checkoutRequestId = stkCallback.CheckoutRequestID

    // Initialize Supabase Admin client (bypasses RLS to update order status)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (resultCode === 0) {
      // Payment Successful
      const metaItems = stkCallback?.CallbackMetadata?.Item
      const mpesaReceipt = metaItems.find(
         (i: any) => i.Name?.toLowerCase() === 'mpesareceiptnumber'
       )?.Value?.toString() || null

      const {data:updatedOrders ,error:orderError} = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'to_be_shipped',
          mpesa_ref: mpesaReceipt,
          updated_on: new Date().toISOString(),
        })
        .eq('mpesa_checkout_id', checkoutRequestId)
        .select('id')

        if (!orderError && updatedOrders && updatedOrders.length > 0) {
        const orderId = updatedOrders[0].id


        const { error: stockError } = await supabaseAdmin
          .rpc('decrement_stock', { p_order_id: orderId })

        if (stockError) {
          console.error("Stock decrement error:", stockError)
        }
      }
    } else {
      // Payment Cancelled or Failed
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('mpesa_checkout_id', checkoutRequestId)
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})