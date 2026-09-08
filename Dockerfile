   # 1. Install dependencies                                                                                                                      
    FROM oven/bun:1-alpine AS deps                                                                                                                 
    WORKDIR /app                                                                                                                                   
    COPY package.json bun.lock ./                                                                                                                  
    RUN bun install --frozen-lockfile                                                                                                              
                                                                                                                                                   
    # 2. Build the app                                                                                                                             
    FROM oven/bun:1-alpine AS builder                                                                                                              
    WORKDIR /app                                                                                                                                   
    COPY --from=deps /app/node_modules ./node_modules                                                                                              
    COPY . .                                                                                                                                       
    ARG BACKEND_INTERNAL_URL="https://api.royalrentalcars.in"                                                                                      
    ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL                                                                                                 
    ENV NEXT_TELEMETRY_DISABLED=1                                                                                                                  
    ENV NODE_ENV=production                                                                                                                        
    RUN bun run build                                                                                                                              
                                                                                                                                                   
    # 3. Production runner (lightweight node image)                                                                                                
    FROM node:24-alpine AS runner                                                                                                                  
    WORKDIR /app                                                                                                                                   
                                                                                                                                                   
    ENV NODE_ENV=production                                                                                                                        
    ENV PORT=3000                                                                                                                                  
    ENV HOSTNAME="0.0.0.0"                                                                                                                         
                                                                                                                                                   
    RUN addgroup --system --gid 1001 nodejs && \                                                                                                   
        adduser --system --uid 1001 nextjs                                                                                                         
                                                                                                                                                   
    # Copy public assets & compiled standalone output                                                                                              
    COPY --from=builder /app/public ./public                                                                                                       
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./                                                                             
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static                                                                     
                                                                                                                                                   
    USER nextjs                                                                                                                                    
                                                                                                                                                   
    EXPOSE 3000                                                                                                                                    
                                                                                                                                                   
    CMD ["node", "server.js"] 