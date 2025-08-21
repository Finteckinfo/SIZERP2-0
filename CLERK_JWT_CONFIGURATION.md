# Clerk JWT Configuration Guide

## **Frontend Configuration (Clerk Dashboard)**

### **1. JWT Template Setup**
- **Template Name**: `API`
- **Token Lifetime**: 3,600 seconds (1 hour)
- **Allowed Clock Skew**: 5 seconds

### **2. JWT Claims Configuration**
```json
{
  "user_id": "{{user.id}}",
  "email": "{{user.primary_email_address.email}}",
  "first_name": "{{user.first_name}}",
  "last_name": "{{user.last_name}}",
  "aud": "https://sizerpbackend2-0-production.up.railway.app"
}
```

**❌ DO NOT INCLUDE THESE (they're auto-generated):**
- `iss` - Clerk sets automatically
- `exp`, `iat`, `nbf` - Clerk sets automatically
- `sub` - Clerk sets automatically (reserved claim)
- `azp`, `fva`, `fea`, `sid`, `v` - Clerk internal fields

### **3. Why This Configuration is Best**
- **`sub`** = `{{user.id}}` (auto-set by Clerk, represents user ID)
- **`user_id`** = `{{user.id}}` (explicit user ID for backend)
- **`email`** = `{{user.primary_email_address.email}}` (for user identification)
- **`aud`** = Your backend URL (for security validation)

## **Backend Configuration (JWKS)**

### **1. Environment Variables**
```bash
# Clerk Configuration
CLERK_ISSUER_URL=https://pumped-sheep-45.clerk.accounts.dev
CLERK_JWKS_URL=https://pumped-sheep-45.clerk.accounts.dev/.well-known/jwks.json
CLERK_AUDIENCE=https://sizerpbackend2-0-production.up.railway.app

# Optional: JWT Verification
JWT_VERIFY_ISSUER=true
JWT_VERIFY_AUDIENCE=true
JWT_VERIFY_EXPIRATION=true
```

### **2. JWT Verification Steps**
1. **Extract token** from `Authorization: Bearer <token>` header
2. **Verify signature** using JWKS from Clerk
3. **Validate claims**:
   - `iss` (issuer) = `https://pumped-sheep-45.clerk.accounts.dev`
   - `aud` (audience) = `https://sizerpbackend2-0-production.up.railway.app`
   - `exp` (expiration) = valid timestamp
   - `sub` (subject) = user ID
   - `user_id` = user ID (explicit)
   - `email` = user email

### **3. Backend Implementation (Node.js/Express Example)**
```javascript
import { verifyToken } from '@clerk/backend';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    const payload = await verifyToken(token, {
      issuer: process.env.CLERK_ISSUER_URL,
      audience: process.env.CLERK_AUDIENCE,
      jwksUrl: process.env.CLERK_JWKS_URL
    });

    // Extract user information
    req.user = {
      id: payload.sub || payload.user_id,
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name
    };

    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

## **Frontend Implementation (Already Done)**

### **1. AuthService**
- ✅ JWT token retrieval from Clerk "API" template
- ✅ Token caching with expiration
- ✅ Automatic token refresh
- ✅ Error handling for missing claims

### **2. API Interceptor**
- ✅ Automatic JWT injection in all API calls
- ✅ Clerk readiness checks
- ✅ Enhanced logging for debugging
- ✅ Global error handling

### **3. Component Guards**
- ✅ Wait for Clerk authentication before API calls
- ✅ Prevent login loops
- ✅ Graceful fallbacks with sample data

## **Testing the Configuration**

### **1. Frontend Test**
1. Open browser DevTools > Console
2. Navigate to the application
3. Look for these messages:
   ```
   [main.ts] Clerk is ready, allowing API calls
   JWT Token obtained: { userId: "user_...", email: "...", audience: "..." }
   🚀 API Request: GET /api/projects/my-projects/simple { hasAuth: true, userId: "user_...", email: "..." }
   ```

### **2. Backend Test**
1. Make an API call from frontend
2. Check backend logs for:
   - JWT token received
   - Claims decoded successfully
   - User authenticated

### **3. Expected JWT Structure**
```json
{
  "sub": "user_31V3XTC4jQ6C9jsIqLeSh7mXT6Z",
  "user_id": "user_31V3XTC4jQ6C9jsIqLeSh7mXT6Z",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "aud": "https://sizerpbackend2-0-production.up.railway.app",
  "iss": "https://pumped-sheep-45.clerk.accounts.dev",
  "exp": 1713158400,
  "iat": 1713158400,
  "nbf": 1713158400
}
```

## **Troubleshooting**

### **Common Issues:**
1. **"Invalid token payload"** → Check JWT template claims
2. **"Invalid or expired token"** → Verify JWKS URL and issuer
3. **"Missing claims"** → Ensure required claims in template
4. **"Signature verification failed"** → Check JWKS endpoint

### **Debug Steps:**
1. **Frontend**: Check console for JWT token details
2. **Backend**: Log received token and decoded claims
3. **Clerk**: Verify template configuration and claims
4. **Network**: Check if JWKS endpoint is accessible

## **Security Best Practices**

✅ **Use JWKS** instead of static keys
✅ **Validate issuer** and audience
✅ **Check expiration** automatically
✅ **Log authentication events**
✅ **Use HTTPS** for all endpoints
✅ **Rate limit** authentication attempts

## **Next Steps**

1. **Update Clerk JWT template** with the simplified claims
2. **Configure backend** with JWKS verification
3. **Test authentication** flow end-to-end
4. **Monitor logs** for any remaining issues
