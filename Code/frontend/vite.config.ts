import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import Sitemap from 'vite-plugin-sitemap'

import prerender from "@prerenderer/rollup-plugin"

// https://vite.dev/config/
export default defineConfig(async({mode}) => {

  const env= loadEnv(mode,process.cwd(),'')

  let dynamicRoutes:string[]=[]

  try{
    const supabaseUrl = env.VITE_SUPABASE_URL
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY

    if (supabaseKey && supabaseUrl){
      const response= await fetch(`${supabaseUrl}/rest/v1/products?select=id`,{
        headers:{
          "apikey":supabaseKey,
          'Authorization':`Bearer ${supabaseKey}`

        }})

        const data = await response.json()

        if (Array.isArray(data)){
          const productRoutes =data.map((p:any)=>`/product/${p.id}`)
          dynamicRoutes.push(...productRoutes)

        const categories=['new-arrivals','hot-products','fans','skin-care','collectibles','lighters','jewellery']
        const categoryRoutes = categories.map(c=>`/category/${c}`)
        dynamicRoutes.push(...categoryRoutes)
      }
    }
  }
  catch(error){
    console.error("Failed to generate dynamic sitemap routes: ",error)
  }
  return{
    plugins:[
      react(),
      tailwindcss(),
      Sitemap({
        hostname:'https://www.tinitrove.co.ke',
        dynamicRoutes,
        exclude:[
          '/admin',
          '/login',
          '/forgot_password',
          '/reset_password',
          '/signup',
          '/orders',
          '/cart',
          '/checkout',
          '/profile'
        ],
        outDir:'dist',
        generateRobotsTxt:false,
      }),
      prerender({
        routes:['/', ...dynamicRoutes],
        renderer:"@prerenderer/renderer-puppeteer",
        rendererOptions:{
          renderAfterTime: 4000
        }
      })
    ],

  resolve:{
    alias:{
      '@': path.resolve(import.meta.dirname, './src'),
    }
  }
}
})
