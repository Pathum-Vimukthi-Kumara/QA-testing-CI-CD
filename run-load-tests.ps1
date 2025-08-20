# PowerShell script to run JMeter load tests
# Usage: .\run-load-tests.ps1 [path-to-jmeter-bin]

param (
    [string]$JMeterPath = "D:\QA\apache-jmeter-5.6.3(1)\apache-jmeter-5.6.3\bin"
)

# Remove parentheses from the path for command execution
$JMeterPathFixed = $JMeterPath -replace "\(1\)", ""

# Create results directory if it doesn't exist
if (-not (Test-Path -Path "load-test-results")) {
    New-Item -Path "load-test-results" -ItemType Directory
}

# Define timestamp for unique filenames
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$resultsFile = "load-test-results\results_$timestamp.csv"
$reportDir = "load-test-results\report_$timestamp"

Write-Host "Starting load test at $(Get-Date)"
Write-Host "=========================================="
Write-Host "Test plan: login-load-test.jmx"
Write-Host "Results will be saved to: $resultsFile"
Write-Host "Report will be generated in: $reportDir"
Write-Host "=========================================="

# Run the test in non-GUI mode
& "$JMeterPathFixed\jmeter.bat" -n -t login-load-test.jmx -l "$resultsFile" -e -o "$reportDir"

# Check if the test completed successfully
if ($LASTEXITCODE -eq 0) {
    Write-Host "=========================================="
    Write-Host "Load test completed successfully at $(Get-Date)"
    Write-Host "Results saved to: $resultsFile"
    Write-Host "Report generated in: $reportDir"
    Write-Host "Open $reportDir\index.html in a browser to view detailed results"
} else {
    Write-Host "=========================================="
    Write-Host "Load test failed at $(Get-Date)"
    Write-Host "Check JMeter logs for errors"
}
