@echo off
echo Starting JMeter load test...

:: Create results directory
if not exist "load-test-results" mkdir "load-test-results"

:: Create timestamped filenames
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set RESULTS_FILE=load-test-results\results_%TIMESTAMP%.csv
set REPORT_DIR=load-test-results\report_%TIMESTAMP%

echo ==========================================
echo Test plan: login-load-test.jmx
echo Results will be saved to: %RESULTS_FILE%
echo Report will be generated in: %REPORT_DIR%
echo ==========================================

:: Run JMeter with explicit path
"D:\QA\apache-jmeter-5.6.3(1)\apache-jmeter-5.6.3\bin\jmeter.bat" -n -t login-load-test.jmx -l %RESULTS_FILE% -e -o %REPORT_DIR%

if %ERRORLEVEL% EQU 0 (
  echo ==========================================
  echo Load test completed successfully
  echo Results saved to: %RESULTS_FILE%
  echo Report generated in: %REPORT_DIR%
  echo Open %REPORT_DIR%\index.html in a browser to view detailed results
) else (
  echo ==========================================
  echo Load test failed
  echo Check JMeter logs for errors
)

pause
