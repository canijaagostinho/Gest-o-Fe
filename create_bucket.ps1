$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodnVqZWRvdHVpYXpic2V1Z2hmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk1MjM2OSwiZXhwIjoyMDg1NTI4MzY5fQ.9Bhwfx9nGSzmT7TqP-Kz0iXC3SEhJZX3ys0GT_0GOU4"
    "Content-Type" = "application/json"
}
$body = Get-Content bucket_config.json -Raw
Invoke-RestMethod -Uri "https://dhvujedotuiazbseughf.supabase.co/storage/v1/bucket" -Method Post -Headers $headers -Body $body
