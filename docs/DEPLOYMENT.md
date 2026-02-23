# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration ✅
- [ ] Set `MONGODB_URI` to production database
- [ ] Set `AUTH_SECRET` to secure random string (min 32 chars)
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Configure `EMAIL_SERVER` for notifications
- [ ] Set `NODE_ENV=production`
- [ ] Enable `ERROR_TRACKING_ENABLED=true`
- [ ] Enable `MONITORING_ENABLED=true`

### 2. Database Setup ✅
- [ ] Create production MongoDB database
- [ ] Create database indexes:
  ```javascript
  db.users.createIndex({ email: 1 }, { unique: true });
  db.auditlogs.createIndex({ userId: 1, timestamp: -1 });
  db.auditlogs.createIndex({ resource: 1, timestamp: -1 });
  db.pettycashtransactions.createIndex({ date: -1 });
  db.pettycashtransactions.createIndex({ status: 1 });
  ```
- [ ] Set up database backups (daily recommended)
- [ ] Configure database monitoring

### 3. Security Verification ✅
- [x] npm audit shows 0 vulnerabilities
- [x] All security headers configured
- [x] Rate limiting implemented
- [x] Input sanitization active
- [x] Audit logging operational
- [ ] SSL/TLS certificate installed
- [ ] Firewall rules configured
- [ ] IP whitelist configured (if needed)

### 4. Build Verification ✅
- [x] `npm run build` completes successfully
- [x] `npm run lint` passes with no errors
- [ ] `npm test` passes all tests
- [ ] Bundle size optimized (<500KB initial)
- [ ] No console.log in production code

### 5. Performance Testing
- [ ] Load testing completed (100+ concurrent users)
- [ ] Database query performance verified (<100ms avg)
- [ ] API endpoints respond <1s
- [ ] Lighthouse score >90
- [ ] Core Web Vitals pass

### 6. Monitoring Setup
- [ ] Error tracking configured (Sentry/Rollbar)
- [ ] Performance monitoring active (Datadog/New Relic)
- [ ] Uptime monitoring (Pingdom/UptimeRobot)
- [ ] Log aggregation (CloudWatch/Loggly)
- [ ] Alert notifications configured

## Deployment Steps

### Option A: Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add MONGODB_URI production
   vercel env add AUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Option B: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine AS base
   
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t planrite-erp .
   docker run -p 3000:3000 --env-file .env.production planrite-erp
   ```

### Option C: Traditional Server Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "planrite-erp" -- start
   pm2 save
   pm2 startup
   ```

## Post-Deployment Verification

### 1. Smoke Tests
- [ ] Homepage loads correctly
- [ ] Login functionality works
- [ ] Dashboard displays data
- [ ] Create fiscal year works
- [ ] Create transaction works
- [ ] Audit logs are being created

### 2. Performance Checks
- [ ] Response times <1s
- [ ] No memory leaks
- [ ] Database connections stable
- [ ] Error rate <0.1%

### 3. Security Checks
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] Authentication working
- [ ] No sensitive data in logs

## Rollback Plan

If issues occur:

1. **Immediate Rollback**
   ```bash
   # Vercel
   vercel rollback
   
   # Docker
   docker stop planrite-erp
   docker run -p 3000:3000 planrite-erp:previous-tag
   
   # PM2
   pm2 stop planrite-erp
   # Deploy previous version
   pm2 start planrite-erp
   ```

2. **Database Rollback**
   - Restore from latest backup
   - Verify data integrity
   - Test critical operations

## Monitoring Dashboard

### Key Metrics to Track

1. **Application Health**
   - Uptime percentage (target: 99.9%)
   - Error rate (target: <0.1%)
   - Response time (target: <1s)

2. **Database Performance**
   - Query time (target: <100ms)
   - Connection pool usage
   - Slow query log

3. **Security Events**
   - Failed login attempts
   - Rate limit violations
   - IP restriction blocks
   - Audit log entries

4. **Business Metrics**
   - Active users
   - Transactions per day
   - Fiscal year operations
   - Module usage statistics

## Maintenance Schedule

### Daily
- Review error logs
- Check performance metrics
- Verify backup completion

### Weekly
- Review security audit logs
- Check for dependency updates
- Performance optimization review

### Monthly
- Security audit
- Database optimization
- User feedback review
- Feature usage analysis

## Support Contacts

- **Technical Lead**: [Your Name]
- **Database Admin**: [DBA Name]
- **Security Team**: [Security Contact]
- **On-Call**: [On-Call Number]

## Emergency Procedures

### System Down
1. Check server status
2. Review error logs
3. Check database connectivity
4. Verify DNS/SSL
5. Contact hosting provider if needed

### Data Breach
1. Immediately isolate affected systems
2. Contact security team
3. Review audit logs
4. Notify affected users
5. Document incident

### Performance Degradation
1. Check server resources
2. Review slow query log
3. Check for DDoS attack
4. Scale resources if needed
5. Optimize bottlenecks

---

**Last Updated**: January 12, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
