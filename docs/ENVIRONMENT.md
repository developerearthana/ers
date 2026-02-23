# Environment Variables Configuration

## Required Variables

### Database
```env
# MongoDB connection string
# Format: mongodb://[username:password@]host[:port]/database
MONGODB_URI=mongodb://localhost:27017/planrite

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/planrite?retryWrites=true&w=majority
```

### Authentication
```env
# NextAuth secret key - MUST be random and secure in production
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-super-secret-key-min-32-characters

# Application URL
NEXTAUTH_URL=http://localhost:3000
# Production: NEXTAUTH_URL=https://yourdomain.com
```

## Optional Variables

### Email Configuration
```env
# SMTP server for email notifications
EMAIL_SERVER=smtp://username:password@smtp.gmail.com:587

# Sender email address
EMAIL_FROM=noreply@yourdomain.com
```

### Monitoring & Logging
```env
# Enable error tracking
ERROR_TRACKING_ENABLED=true

# Enable performance monitoring
MONITORING_ENABLED=true

# Sentry DSN (if using Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Feature Flags
```env
# Enable IP restriction feature
IP_RESTRICTION_ENABLED=true

# Enable audit logging
AUDIT_LOGGING_ENABLED=true
```

## Environment-Specific Configurations

### Development (.env.local)
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/planrite-dev
AUTH_SECRET=dev-secret-key-not-for-production
NEXTAUTH_URL=http://localhost:3000
ERROR_TRACKING_ENABLED=false
MONITORING_ENABLED=false
```

### Staging (.env.staging)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@staging-cluster.mongodb.net/planrite-staging
AUTH_SECRET=staging-secret-key-change-in-production
NEXTAUTH_URL=https://staging.yourdomain.com
ERROR_TRACKING_ENABLED=true
MONITORING_ENABLED=true
EMAIL_SERVER=smtp://user:pass@smtp.gmail.com:587
EMAIL_FROM=staging@yourdomain.com
```

### Production (.env.production)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net/planrite
AUTH_SECRET=super-secure-random-key-32-chars-minimum
NEXTAUTH_URL=https://yourdomain.com
ERROR_TRACKING_ENABLED=true
MONITORING_ENABLED=true
EMAIL_SERVER=smtp://user:pass@smtp.yourdomain.com:587
EMAIL_FROM=noreply@yourdomain.com
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
IP_RESTRICTION_ENABLED=true
AUDIT_LOGGING_ENABLED=true
```

## Security Best Practices

1. **Never commit `.env` files to version control**
   - Already in `.gitignore`
   - Use environment variable management tools

2. **Use strong secrets**
   ```bash
   # Generate secure random strings
   openssl rand -base64 32
   ```

3. **Rotate secrets regularly**
   - Change AUTH_SECRET every 90 days
   - Update database passwords quarterly

4. **Use secret management services**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Vercel Environment Variables

## Verification

Check if all required variables are set:
```bash
# In your terminal
node -e "console.log(process.env.MONGODB_URI ? '✓ MONGODB_URI set' : '✗ MONGODB_URI missing')"
node -e "console.log(process.env.AUTH_SECRET ? '✓ AUTH_SECRET set' : '✗ AUTH_SECRET missing')"
node -e "console.log(process.env.NEXTAUTH_URL ? '✓ NEXTAUTH_URL set' : '✗ NEXTAUTH_URL missing')"
```
