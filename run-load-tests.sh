#!/bin/bash
# Script to run JMeter load tests and generate a report
# Usage: ./run-load-tests.sh [path-to-jmeter]

# Default JMeter path - update this for your environment
DEFAULT_JMETER_PATH="/path/to/apache-jmeter/bin"
JMETER_PATH=${1:-$DEFAULT_JMETER_PATH}

# Create results directory if it doesn't exist
mkdir -p load-test-results

# Define timestamp for unique filenames
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="load-test-results/results_${TIMESTAMP}.csv"
REPORT_DIR="load-test-results/report_${TIMESTAMP}"

echo "Starting load test at $(date)"
echo "=========================================="
echo "Test plan: login-load-test.jmx"
echo "Results will be saved to: $RESULTS_FILE"
echo "Report will be generated in: $REPORT_DIR"
echo "=========================================="

# Run the test in non-GUI mode
"${JMETER_PATH}/jmeter" -n -t login-load-test.jmx \
  -l "$RESULTS_FILE" \
  -e -o "$REPORT_DIR"

# Check if the test completed successfully
if [ $? -eq 0 ]; then
  echo "=========================================="
  echo "Load test completed successfully at $(date)"
  echo "Results saved to: $RESULTS_FILE"
  echo "Report generated in: $REPORT_DIR"
  echo "Open $REPORT_DIR/index.html in a browser to view detailed results"
else
  echo "=========================================="
  echo "Load test failed at $(date)"
  echo "Check JMeter logs for errors"
fi
