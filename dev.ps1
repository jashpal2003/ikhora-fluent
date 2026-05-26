#!/usr/bin/env pwsh
# ================================================
# Ikhora Fluent — Dev Server Startup Script
# Run this instead of `npx next dev` to ensure
# correct Azure OpenAI credentials are loaded
# even if Windows system env vars conflict.
# ================================================

Write-Host "=== Ikhora Fluent Dev Server ===" -ForegroundColor Cyan

# Set the correct Azure OpenAI credentials for this session
$env:AZURE_OPENAI_ENDPOINT  = "https://jashp-mmglb5d1-uaenorth.openai.azure.com/openai/v1"
$env:AZURE_OPENAI_API_KEY   = "<YOUR-AZURE-OPENAI-API-KEY>"
$env:AI_PRIMARY_DEPLOYMENT  = "gpt-5.4-mini"

Write-Host "Azure OpenAI: $env:AZURE_OPENAI_ENDPOINT" -ForegroundColor Green
Write-Host "Model: $env:AI_PRIMARY_DEPLOYMENT" -ForegroundColor Green
Write-Host ""

# Start Next.js dev server
Set-Location "$PSScriptRoot\apps\web"
npx next dev --port 3000
