package dto

type AdminAuthPayload struct {
	CurrentPin string `json:"currentPin"`
	NewPin     string `json:"newPin"`
	Pin        string `json:"pin"`
}
