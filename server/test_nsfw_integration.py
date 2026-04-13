"""
NSFW Detection Integration Tests
Quick verification that the system is working
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def test_nsfw_module():
    """Test that NSFW module imports and initializes correctly"""
    print("🧪 Testing NSFW Detection Module...")
    
    try:
        from app.services.nsfw_detection import get_detector, detect_nsfw_offline
        print("✅ Successfully imported NSFW module")
        
        # Try to initialize detector (lazy load)
        detector = get_detector()
        print("✅ Successfully initialized NudeNet detector")
        
        print("\n📊 Module Status:")
        print(f"   - Detector type: {type(detector).__name__}")
        print(f"   - Module loaded: Yes")
        print(f"   - Ready for processing: Yes")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Install required packages: pip install nudenet torch torchvision")
        return False
    except Exception as e:
        print(f"❌ Initialization error: {e}")
        return False


async def test_config():
    """Test that configuration loads correctly"""
    print("\n🧪 Testing Configuration...")
    
    try:
        from app.core.config import (
            NSFW_ENABLED, 
            NSFW_THRESHOLD, 
            NSFW_BLOCK_THRESHOLD,
            USE_ONLINE_MODERATION
        )
        
        print("✅ Configuration loaded successfully")
        print("\n📋 NSFW Settings:")
        print(f"   - NSFW_ENABLED: {NSFW_ENABLED}")
        print(f"   - NSFW_THRESHOLD: {NSFW_THRESHOLD} (flag for review)")
        print(f"   - NSFW_BLOCK_THRESHOLD: {NSFW_BLOCK_THRESHOLD} (reject)")
        print(f"   - USE_ONLINE_MODERATION: {USE_ONLINE_MODERATION}")
        
        return True
        
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False


async def test_model_schema():
    """Test that Report model includes NSFW fields"""
    print("\n🧪 Testing Report Model Schema...")
    
    try:
        from app.models.report import Report
        
        report_fields = Report.model_fields.keys()
        nsfw_fields = ['nsfw_score', 'is_nsfw', 'is_flagged', 'nsfw_detection_method', 'image_blurred']
        
        missing_fields = [f for f in nsfw_fields if f not in report_fields]
        
        if not missing_fields:
            print("✅ All NSFW fields present in Report model")
            print("\n📋 NSFW Model Fields:")
            for field in nsfw_fields:
                print(f"   - {field}")
            return True
        else:
            print(f"❌ Missing fields: {missing_fields}")
            return False
            
    except Exception as e:
        print(f"❌ Model error: {e}")
        return False


async def run_tests():
    """Run all tests"""
    print("=" * 60)
    print("🚀 ALERTO NSFW DETECTION SYSTEM - INTEGRATION TESTS")
    print("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("Config Loading", await test_config()))
    results.append(("Model Schema", await test_model_schema()))
    results.append(("NSFW Module", await test_nsfw_module()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All systems ready for NSFW detection!")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please review the errors above.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(run_tests())
    sys.exit(exit_code)
