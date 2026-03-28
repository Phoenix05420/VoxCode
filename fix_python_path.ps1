$pythonPath = "C:\Python\Python311"
$scriptsPath = "$pythonPath\Scripts"

# Get current user path
$currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)

# Check if paths are already included
if ($currentPath -like "*$pythonPath*" -and $currentPath -like "*$scriptsPath*") {
    Write-Host "Python paths are already in your User PATH." -ForegroundColor Green
} else {
    # Append paths
    $newPath = $currentPath + ";" + $pythonPath + ";" + $scriptsPath
    [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::User)
    Write-Host "Success! Added $pythonPath and $scriptsPath to your User PATH." -ForegroundColor Green
    Write-Host "IMPORTANT: Please restart your terminal/PowerShell window for the changes to take effect." -ForegroundColor Yellow
}
