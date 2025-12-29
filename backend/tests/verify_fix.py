import unittest
from unittest.mock import patch, MagicMock
from auditor import GitHubAuditor
import requests

class TestAuditorResilience(unittest.TestCase):
    
    @patch('requests.get')
    def test_auditor_handles_offline_mode(self, mock_get):
        """
        Simulate a total network failure (Wi-Fi off).
        """
        print("\n--- TEST: Simulating Network Crash ---")
        
        # 1. Force requests.get to raise a Connection Error (like pulling the plug)
        mock_get.side_effect = requests.exceptions.ConnectionError("No Internet Connection")
        
        auditor = GitHubAuditor()
        
        # 2. Attempt to calculate trust score
        result = auditor.calculate_trust_score("torvalds")
        
        # 3. VERIFICATION
        print(f"Result received: {result}")
        
        # Did it crash? No, we are still running.
        self.assertIsNotNone(result, "Auditor returned None! It should return a safe error dict.")
        self.assertIn("error", result, "Auditor did not report an error state.")
        self.assertEqual(result["trust_score"], 0, "Trust score should default to 0 on error.")
        
        print("✅ SUCCESS: The system survived the network crash!")

if __name__ == '__main__':
    unittest.main()