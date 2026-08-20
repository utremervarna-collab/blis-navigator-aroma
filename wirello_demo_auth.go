package main

// Wirello MASTER DEMO account. The stored value is a one-way SHA-256 credential hash
// using the same client account scheme as the existing Navigator gateway.
func init() {
	clientAccounts["wirello.demo"] = clientAccount{
		Username:     "wirello.demo",
		PasswordHash: "46041343ae35090d6ced5bb27661220505d430e0c0f9868fef4ac708f9102f27",
		ClientSlug:   "wirello",
		ClientName:   "Wirello Market",
		Sector:       "Retail / Grocery / FMCG",
	}
}
