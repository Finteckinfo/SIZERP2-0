# Security Documentation

**Author:** Llakterian  
**Last Updated:** November 2025

## Table of Contents

1. [Authentication Flow Overview](#authentication-flow-overview)
2. [Password Policy](#password-policy)
3. [Encryption Standards](#encryption-standards)
4. [Security Questions](#security-questions)
5. [Recovery Mechanisms](#recovery-mechanisms)
6. [Best Practices](#best-practices)

---

## Authentication Flow Overview

This project implements a dual-mode authentication system:

### Web3 Mode (Wallet-First Authentication)

**New Wallet Creation Flow:**
1. User selects "Create New Wallet" from authentication choice screen
2. System generates Algorand wallet client-side using Web Crypto API
3. User is presented with 25-word mnemonic phrase for backup
4. User confirms phrase has been saved
5. User sets password (12+ characters with complexity requirements)
6. User answers 3 security questions for account recovery
7. Wallet is encrypted with AES-256-GCM and stored in localStorage
8. User gains access to platform

**Existing Wallet Connection Flow:**
1. User selects "Connect Existing Wallet"
2. User chooses wallet provider (Pera, Defly, or WalletConnect)
3. Wallet connection is established via @txnlab/use-wallet-vue
4. User gains access to platform

### Web2 Mode (Traditional Authentication)

**Clerk-Based Flow:**
1. User selects traditional authentication method
2. User signs in/up via Clerk (email/social providers)
3. Clerk handles authentication and session management
4. User is redirected to /dashboard/default upon success

---

## Password Policy

### Requirements

All passwords created in Web3 mode must meet the following criteria:

- **Minimum Length:** 12 characters
- **Uppercase Letters:** At least 1 uppercase letter (A-Z)
- **Lowercase Letters:** At least 1 lowercase letter (a-z)
- **Numbers:** At least 1 digit (0-9)
- **Special Characters:** At least 1 special character (!@#$%^&*()_+-=[]{}|;:',.<>?/)

### Password Strength Indicators

The system provides real-time visual feedback:

- **Weak (0-49%):** Red indicator - Does not meet minimum requirements
- **Medium (50-74%):** Yellow indicator - Meets basic requirements
- **Strong (75-100%):** Green indicator - Exceeds minimum requirements

### Validation Rules

```typescript
const rules = {
  required: (v: string) => !!v || 'This field is required',
  minLength: (v: string) => v.length >= 12 || 'Password must be at least 12 characters',
  hasUpperCase: (v: string) => /[A-Z]/.test(v) || 'Password must contain an uppercase letter',
  hasLowerCase: (v: string) => /[a-z]/.test(v) || 'Password must contain a lowercase letter',
  hasNumber: (v: string) => /\d/.test(v) || 'Password must contain a number',
  hasSpecial: (v: string) => /[^a-zA-Z\d]/.test(v) || 'Password must contain a special character',
  match: (v: string) => v === password.value || 'Passwords must match'
};
```

---

## Encryption Standards

### Client-Side Encryption

All wallet encryption happens exclusively in the browser using the Web Crypto API (SubtleCrypto). Sensitive data never leaves the client in unencrypted form.

### AES-256-GCM

**Algorithm:** AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)  
**Key Length:** 256 bits  
**Mode:** Authenticated encryption with additional data (AEAD)

**Advantages:**
- Provides both confidentiality and authenticity
- Resistant to tampering and forgery
- Industry-standard for symmetric encryption
- Hardware acceleration available on most platforms

### PBKDF2 Key Derivation

**Algorithm:** PBKDF2 (Password-Based Key Derivation Function 2)  
**Hash Function:** SHA-256  
**Iterations:** 100,000  
**Salt Length:** 128 bits (16 bytes)

**Rationale for 100,000 iterations:**
- OWASP recommendation for PBKDF2-SHA256 is 600,000+ iterations (2023)
- However, we balanced security with user experience:
  - 100,000 iterations provides strong protection against brute-force attacks
  - Keeps key derivation time under 200ms on modern devices
  - Significantly higher than the NIST minimum of 10,000 iterations
  - Can be increased in future versions as hardware improves

**Note:** While 100,000 iterations is acceptable, future updates should consider increasing to 600,000+ iterations as recommended by OWASP, with progressive enhancement based on device capabilities.

### Initialization Vector (IV)

**Length:** 96 bits (12 bytes)  
**Generation:** Cryptographically secure random number generator  
**Uniqueness:** New IV generated for each encryption operation

### Salt

**Length:** 128 bits (16 bytes)  
**Generation:** Cryptographically secure random number generator  
**Purpose:** Prevents rainbow table attacks and ensures unique keys

---

## Security Questions

### Purpose

Security questions provide a secondary authentication mechanism for account recovery when users forget their password.

### Implementation

**Number of Questions:** 3 required questions  
**Answer Hashing:** SHA-256 (answers stored as hashes, never plaintext)  
**Storage:** localStorage (hashed answers only)

### Available Questions

1. What is your mother's maiden name?
2. What was the name of your first pet?
3. What city were you born in?
4. What is your favorite food?
5. What was the name of your elementary school?
6. What is the name of the street you grew up on?
7. What is your favorite book?
8. What was your childhood nickname?

### Security Considerations

- Each question can only be selected once per user
- Answers are case-sensitive and stored as SHA-256 hashes
- Users must provide exact answers during recovery
- No hints or partial matching available

---

## Recovery Mechanisms

### Password Recovery

**Not Available:** Due to the nature of client-side encryption, password recovery is not possible. If a user forgets their password, they cannot decrypt their wallet.

### Account Recovery

**Security Questions Flow:**
1. User navigates to account recovery
2. System prompts for answers to 3 security questions
3. If all answers match (compared via SHA-256 hash), user can set new password
4. Wallet is re-encrypted with new password
5. User regains access to account

### Mnemonic Phrase Recovery

**Primary Recovery Method:**
1. User accesses wallet recovery interface
2. User enters 25-word mnemonic phrase in correct order
3. System validates and regenerates wallet
4. User sets new password and security questions
5. Wallet is encrypted and stored

**Critical Notes:**
- Mnemonic phrase is the ultimate recovery mechanism
- Users MUST save their mnemonic phrase during wallet creation
- Lost mnemonic phrases cannot be recovered
- System displays prominent warnings during wallet creation

---

## Best Practices

### For Users

1. **Save Mnemonic Phrase:** Write down the 25-word phrase and store it securely offline
2. **Use Strong Passwords:** Follow all password policy requirements
3. **Remember Security Answers:** Choose memorable but secure answers
4. **Never Share Credentials:** Never share password, mnemonic, or security answers
5. **Regular Backups:** Export encrypted wallet backups periodically

### For Developers

1. **Never Log Sensitive Data:** Avoid logging passwords, mnemonics, or private keys
2. **Client-Side Only:** Keep all encryption operations in the browser
3. **Secure Storage:** Use localStorage only for encrypted data
4. **Regular Audits:** Review security implementations regularly
5. **Keep Dependencies Updated:** Monitor for security updates in crypto libraries
6. **Input Validation:** Always validate user inputs on both client and server
7. **Error Handling:** Provide generic error messages to avoid information leakage

### Security Checklist for Code Reviews

- [ ] All sensitive data encrypted before storage
- [ ] No plaintext passwords in localStorage
- [ ] PBKDF2 iterations set to 100,000 or higher
- [ ] Random salts and IVs generated for each encryption
- [ ] Security question answers properly hashed
- [ ] No sensitive data in console.log statements
- [ ] Proper error handling without information disclosure
- [ ] User input properly validated and sanitized
- [ ] Web Crypto API used for all cryptographic operations
- [ ] No hardcoded secrets or keys in source code

---

## Security Contacts

For security concerns or vulnerability reports, please contact the development team immediately.

**Do not disclose security vulnerabilities publicly until they have been addressed.**

---

## Version History

- **v1.0 (November 2025):** Initial security documentation - Llakterian
  - Documented Web3/Web2 dual authentication flow
  - Defined password policy (12+ characters with complexity)
  - Documented AES-256-GCM encryption implementation
  - Documented PBKDF2 key derivation (100,000 iterations)
  - Outlined security question implementation
  - Defined recovery mechanisms

---

## References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST SP 800-63B Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Web Crypto API Specification](https://www.w3.org/TR/WebCryptoAPI/)
- [AES-GCM Security Considerations](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
