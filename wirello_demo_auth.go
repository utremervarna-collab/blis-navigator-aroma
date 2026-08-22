package main

// Wirello Market — synthetic MASTER DEMO account.
// Demo password: demo (stored only as the standard one-way BLIS client hash).
func init() {
	clientAccounts["demo@wirello.market"] = clientAccount{
		Username:     "demo@wirello.market",
		PasswordHash: "540409858af733c7bbcfd8073753833fdbc6bf0ec8b8408a22b4b1b4cb312a7d",
		ClientSlug:   "wirello",
		ClientName:   "Wirello Market",
		Sector:       "Omnichannel retail / FMCG",
	}
}
