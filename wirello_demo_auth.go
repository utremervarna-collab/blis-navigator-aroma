package main

// Wirello Market — synthetic MASTER DEMO account.
// Uses the original demo credentials so existing presentations keep working.
func init() {
	clientAccounts["wirello.demo"] = clientAccount{
		Username:     "wirello.demo",
		PasswordHash: "46041343ae35090d6ced5bb27661220505d430e0c0f9868fef4ac708f9102f27",
		ClientSlug:   "wirello",
		ClientName:   "Wirello Market",
		Sector:       "Омниканален ритейл / FMCG",
	}
}
