# Build your JSON body the same way
$base64String = Get-Content -Path "C:\Users\krahn\Pictures\Projects\photo-op-mvp\ai_model\base64test1.txt" | Out-String
$base64String = $base64String -replace "`r?`n",""

$body = @{
  prompt = "A futuristic portrait"
  photo  = $base64String
}
$jsonBody = $body | ConvertTo-Json

# Use Invoke-RestMethod
Invoke-RestMethod -Uri "http://localhost:5002/generate" `
  -Method POST `
  -Body $jsonBody `
  -ContentType "application/json"
