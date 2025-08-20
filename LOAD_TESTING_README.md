# Load Testing with JMeter

This directory contains JMeter test plans for load testing the Driving License Tracker application.

## Prerequisites

1. Install Apache JMeter from https://jmeter.apache.org/download_jmeter.cgi
2. Extract the downloaded archive
3. Add JMeter's `bin` directory to your PATH (optional)

## Test Plans

### Login API Load Test

Tests the login API endpoint with multiple simulated users.

- **File**: `login-load-test.jmx`
- **Description**: Simulates 50 users logging in over a 30-second period, repeating 5 times
- **Endpoint**: `/api/auth/login`

### Test Data

- `test-users.csv`: Contains sample user credentials for load testing
- Format: email,password (first line is header)

## Running Tests

### GUI Mode

1. Start JMeter: `jmeter` or `jmeter.bat`
2. Open the test plan: File → Open → `login-load-test.jmx`
3. Click the Run button (green triangle) or press Ctrl+R
4. View results in the various listener panels

### Non-GUI Mode (Recommended for actual load testing)

Use the provided script:

```bash
./run-load-tests.sh [path-to-jmeter/bin]
```

Or run manually:

```bash
jmeter -n -t login-load-test.jmx -l results.csv -e -o ./report
```

## Analyzing Results

After running the test, examine:

1. **Summary Report**: Overall metrics including throughput, error rate, and response times
2. **Aggregate Report**: Detailed statistics for each sampler
3. **Response Time Graph**: Visual representation of response times over test duration
4. **HTML Report**: Generated when running in non-GUI mode (`./report/index.html`)

## Key Metrics to Monitor

- **Throughput**: Requests per second the API handles
- **Average Response Time**: Average time taken for requests
- **Error Rate**: Percentage of failed requests
- **90% Line**: Response time for 90% of requests (indicates user experience)
- **Min/Max**: Minimum and maximum response times

## Potential Bottlenecks

If performance issues are identified, investigate:

1. **Database queries**: Check for unindexed columns or inefficient joins
2. **Server resources**: Monitor CPU, memory, and network usage
3. **Connection pooling**: Ensure proper configuration
4. **Caching**: Consider implementing or optimizing caching

## Integrating with CI/CD

To include load testing in your CI/CD pipeline, add this step to your workflow:

```yaml
- name: Run load tests
  run: |
    # Install JMeter
    wget https://downloads.apache.org/jmeter/binaries/apache-jmeter-5.5.tgz
    tar -xzf apache-jmeter-5.5.tgz
    
    # Run tests
    ./apache-jmeter-5.5/bin/jmeter -n -t login-load-test.jmx \
      -l results.csv -e -o ./load-test-report
      
    # Optional: Fail if error rate exceeds threshold
    ERROR_RATE=$(grep -Po 'Total,\d+,\d+,\d+,\d+,\d+,\d+,[\d\.]+,[\d\.]+,([\d\.]+)' results.csv | cut -d',' -f10)
    if (( $(echo "$ERROR_RATE > 5.0" | bc -l) )); then
      echo "Error rate of $ERROR_RATE% exceeds threshold of 5%"
      exit 1
    fi
```
