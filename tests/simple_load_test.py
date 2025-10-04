"""
Simple load test for Lani Bot API
Run with: python simple_load_test.py
"""
import requests
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from statistics import mean, median

BASE_URL = "http://localhost:8080"
NUM_REQUESTS = 50
CONCURRENT_USERS = 10

def test_health():
    """Test health endpoint"""
    start = time.time()
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        duration = time.time() - start
        return {
            "endpoint": "/health",
            "status": response.status_code,
            "duration": duration,
            "success": response.status_code == 200
        }
    except Exception as e:
        return {
            "endpoint": "/health",
            "status": 0,
            "duration": time.time() - start,
            "success": False,
            "error": str(e)
        }

def test_static_question():
    """Test static question endpoint"""
    start = time.time()
    try:
        payload = {"llab_numbers": [2, 4]}
        response = requests.post(
            f"{BASE_URL}/static-question",
            json=payload,
            timeout=10
        )
        duration = time.time() - start
        return {
            "endpoint": "/static-question",
            "status": response.status_code,
            "duration": duration,
            "success": response.status_code == 200
        }
    except Exception as e:
        return {
            "endpoint": "/static-question",
            "status": 0,
            "duration": time.time() - start,
            "success": False,
            "error": str(e)
        }

def run_load_test():
    """Run concurrent load test"""
    print("=" * 60)
    print("Lani Bot API - Simple Load Test")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Total Requests: {NUM_REQUESTS}")
    print(f"Concurrent Users: {CONCURRENT_USERS}")
    print("-" * 60)
    
    results = []
    
    # Test with ThreadPoolExecutor for concurrency
    with ThreadPoolExecutor(max_workers=CONCURRENT_USERS) as executor:
        futures = []
        
        # Submit health check tests
        for i in range(NUM_REQUESTS // 2):
            futures.append(executor.submit(test_health))
        
        # Submit static question tests
        for i in range(NUM_REQUESTS // 2):
            futures.append(executor.submit(test_static_question))
        
        # Collect results
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            
            # Show progress
            if len(results) % 10 == 0:
                print(f"Completed: {len(results)}/{NUM_REQUESTS}")
    
    # Calculate statistics
    print("-" * 60)
    print("Results:")
    print("-" * 60)
    
    # Overall stats
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    durations = [r["duration"] for r in successful]
    
    print(f"Total Requests: {len(results)}")
    print(f"Successful: {len(successful)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"Failed: {len(failed)} ({len(failed)/len(results)*100:.1f}%)")
    
    if durations:
        durations_sorted = sorted(durations)
        p95_index = int(len(durations_sorted) * 0.95)
        p95_duration = durations_sorted[p95_index] if p95_index < len(durations_sorted) else durations_sorted[-1]
        
        print(f"\nResponse Times:")
        print(f"  Min: {min(durations):.3f}s")
        print(f"  Max: {max(durations):.3f}s")
        print(f"  Mean: {mean(durations):.3f}s")
        print(f"  Median: {median(durations):.3f}s")
        print(f"  P95: {p95_duration:.3f}s")
    
    # Endpoint-specific stats
    print(f"\nBy Endpoint:")
    for endpoint in ["/health", "/static-question"]:
        endpoint_results = [r for r in results if r["endpoint"] == endpoint]
        endpoint_success = [r for r in endpoint_results if r["success"]]
        endpoint_durations = [r["duration"] for r in endpoint_success]
        
        print(f"\n{endpoint}:")
        print(f"  Requests: {len(endpoint_results)}")
        print(f"  Success Rate: {len(endpoint_success)/len(endpoint_results)*100:.1f}%")
        if endpoint_durations:
            print(f"  Avg Duration: {mean(endpoint_durations):.3f}s")
    
    # Check if performance targets met
    print(f"\n{'=' * 60}")
    print("Performance Targets:")
    if durations and p95_duration < 1.5:
        print(f"✅ P95 < 1.5s: PASS ({p95_duration:.3f}s)")
    elif durations:
        print(f"❌ P95 < 1.5s: FAIL ({p95_duration:.3f}s)")
    
    if len(failed) / len(results) < 0.1:
        print(f"✅ Error Rate < 10%: PASS ({len(failed)/len(results)*100:.1f}%)")
    else:
        print(f"❌ Error Rate < 10%: FAIL ({len(failed)/len(results)*100:.1f}%)")
    
    print("=" * 60)
    
    # Show errors if any
    if failed:
        print("\nErrors:")
        for r in failed[:5]:  # Show first 5 errors
            print(f"  {r['endpoint']}: {r.get('error', 'Unknown error')}")

if __name__ == "__main__":
    try:
        # First check if server is up
        print("Checking if server is accessible...")
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is ready!\n")
            run_load_test()
        else:
            print(f"❌ Server returned status {response.status_code}")
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print(f"\nMake sure the backend is running at {BASE_URL}")
        print("Start with: docker-compose up -d")
