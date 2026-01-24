# In-App Purchase Setup Guide

## 1. App Store Connect Setup

### Create In-App Purchases

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → **Features** → **In-App Purchases**
3. Click **+** to create each product:

#### Product 1: Pro Monthly
- **Type:** Auto-Renewable Subscription
- **Reference Name:** Pro Monthly
- **Product ID:** `com.the66challenge.pro.monthly`
- **Subscription Group:** `Pro Access`
- **Price:** €4.99/month

#### Product 2: Pro Annual
- **Type:** Auto-Renewable Subscription
- **Reference Name:** Pro Annual
- **Product ID:** `com.the66challenge.pro.annual`
- **Subscription Group:** `Pro Access`
- **Price:** €34.99/year

#### Product 3: Pro Lifetime
- **Type:** Non-Consumable
- **Reference Name:** Pro Lifetime
- **Product ID:** `com.the66challenge.pro.lifetime`
- **Price:** €69.99

### Configure Subscription Group

1. Go to **Subscriptions** → **Subscription Groups**
2. Create group: **Pro Access**
3. Add both Monthly and Annual subscriptions to this group
4. Set Annual as "Level 1" (higher value)
5. Set Monthly as "Level 2" (lower value)

---

## 2. iOS Native Code

For production, you'll need native StoreKit 2 integration. Create this Swift file:

### `ios/App/App/StoreKitManager.swift`

```swift
import StoreKit

@MainActor
class StoreKitManager: ObservableObject {
    static let shared = StoreKitManager()
    
    @Published var products: [Product] = []
    @Published var purchasedProductIDs: Set<String> = []
    
    private let productIDs = [
        "com.the66challenge.pro.monthly",
        "com.the66challenge.pro.annual",
        "com.the66challenge.pro.lifetime"
    ]
    
    init() {
        Task {
            await loadProducts()
            await updatePurchasedProducts()
        }
    }
    
    func loadProducts() async {
        do {
            products = try await Product.products(for: productIDs)
        } catch {
            print("Failed to load products: \(error)")
        }
    }
    
    func purchase(_ product: Product) async throws -> Transaction? {
        let result = try await product.purchase()
        
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await updatePurchasedProducts()
            await transaction.finish()
            return transaction
        case .userCancelled, .pending:
            return nil
        @unknown default:
            return nil
        }
    }
    
    func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let safe):
            return safe
        }
    }
    
    func updatePurchasedProducts() async {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            purchasedProductIDs.insert(transaction.productID)
        }
    }
    
    func restorePurchases() async {
        await updatePurchasedProducts()
    }
    
    var isPro: Bool {
        !purchasedProductIDs.isEmpty
    }
}

enum StoreError: Error {
    case failedVerification
}
```

---

## 3. Capacitor Plugin Bridge

For web-to-native communication, you'll need a Capacitor plugin. For now, purchases work in simulation mode for testing.

### Production Implementation

When ready for production:

1. Install `capacitor-plugin-inapppurchases`:
```bash
npm install @nicklason/capacitor-plugin-inapppurchases
```

2. Update the `purchase()` function in `SubscriptionContext.tsx` to use native StoreKit

---

## 4. Testing

### Sandbox Testing

1. Create Sandbox Tester Account:
   - App Store Connect → Users and Access → Sandbox Testers
   - Add new tester with a unique email

2. On your test device:
   - Sign out of App Store (Settings → App Store → Sign Out)
   - Don't sign back in
   - The app will prompt for sandbox credentials when purchasing

### Testing Subscription Scenarios

- Monthly → Cancel after 5 minutes (sandbox time)
- Annual → Renewal after 1 hour (sandbox time)
- Lifetime → Instant unlock, persists forever

---

## 5. Review Guidelines

Apple requires:

1. **Restore Purchases** button (✅ included in Paywall)
2. **Privacy Policy** link (✅ included)
3. **Terms of Service** link (✅ included)
4. Clear pricing display (✅ included)
5. Subscription terms in description

### App Store Description Addition

Add to your app description:
```
SUBSCRIPTION INFO:
- Pro Monthly: €4.99/month
- Pro Annual: €34.99/year (save 40%)
- Pro Lifetime: €69.99 (one-time purchase)

Payment will be charged to your Apple ID account at confirmation of purchase. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase.

Privacy Policy: https://66-challenge.vercel.app/privacy
Terms of Use: https://66-challenge.vercel.app/terms
```

---

## Summary

| Product | ID | Price | Type |
|---------|-----|-------|------|
| Monthly | com.the66challenge.pro.monthly | €4.99/mo | Auto-Renewable |
| Annual | com.the66challenge.pro.annual | €34.99/yr | Auto-Renewable |
| Lifetime | com.the66challenge.pro.lifetime | €69.99 | Non-Consumable |
