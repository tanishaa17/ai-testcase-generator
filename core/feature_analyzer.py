"""
Feature Gap Analysis Module
Provides AI-powered feature gap analysis to identify missing functionality.
"""

import google.generativeai as genai
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

def analyze_feature_gaps(requirement_text: str, generated_tests: List[Dict[str, Any]], 
                         domain: str = "healthcare software") -> Dict[str, Any]:
    """
    AI-powered feature gap analysis to identify missing functionality in test coverage.
    
    Implements the "Provide Feature Gap Analysis" step from the architecture.
    
    Args:
        requirement_text: Original requirement text
        generated_tests: List of generated test cases
        domain: Domain context
    
    Returns:
        Analysis results including gaps, recommendations, and coverage metrics
    """
    # Extract features from generated tests
    test_features = []
    for test in generated_tests:
        test_features.append({
            "test_id": test.get("test_id"),
            "requirement_source": test.get("requirement_source"),
            "description": test.get("gherkin_feature", "")[:200]  # First 200 chars
        })
    
    prompt = f"""You are a senior QA architect specializing in {domain} with expertise in FDA, HIPAA, GDPR compliance.

Your task is to analyze the requirements and generated test cases to identify FEATURE GAPS - functionality that may not have adequate test coverage.

--- ORIGINAL REQUIREMENTS ---
{requirement_text}

--- GENERATED TEST CASES ---
{json.dumps(test_features, indent=2)}

--- ANALYSIS REQUIRED ---
Identify:
1. Missing emails functionality
2. Incomplete coverage areas
3. Compliance gaps (GDPR, HIPAA, FDA, IEC 62304, ISO 13485)
4. Edge cases not covered
5. Integration points not tested
6. Data flow scenarios missing
7. Security controls not validated
8. User interaction flows incomplete

Your output MUST be a single, valid JSON object with this structure:
{{
  "overall_coverage_score": <integer 0-100>,
  "missing_features": [
    {{
      "feature": "<feature name>",
      "severity": "high|medium|low",
      "reason": "<explanation>",
      "recommended_test_type": "<test type>"
    }}
  ],
  "compliance_gaps": [
    {{
      "standard": "FDA|HIPAA|GDPR|ISO 13485|IEC 62304",
      "gap": "<specific gap>",
      "risk": "<risk description>"
    }}
  ],
  "recommendations": [
    "<specific recommendation>"
  ],
  "priority_actions": [
    {{
      "action": "<specific action>",
      "priority": "P0|P1|P2|P3"
    }}
  ]
}}

Produce the JSON output now.
"""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        analysis = json.loads(cleaned_response)
        
        # Add metadata
        analysis["timestamp"] = datetime.now().isoformat()
        analysis["total_tests"] = len(generated_tests)
        
        return analysis
    
    except Exception as e:
        return {
            "error": f"Failed to analyze feature gaps: {str(e)}",
            "overall_coverage_score": 0
        }


def export_analysis_report(analysis: Dict[str, Any], format: str = "json") -> str:
    """
    Export feature gap analysis in various formats for reporting.
    
    Args:
        analysis: Analysis results from analyze_feature_gaps()
        format: Export format (json, markdown, csv)
    
    Returns:
        Formatted report as string
    """
    if format == "json":
        return json.dumps(analysis, indent=2)
    
    elif format == "markdown":
        markdown = f"""# Feature Gap Analysis Report

## Overview
- **Coverage Score**: {analysis.get('overall_coverage_score', 0)}/100
- **Total Tests**: {analysis.get('total_tests', 0)}
- **Generated**: {analysis.get('timestamp', 'N/A')}

## Missing Features ({len(analysis.get('missing_features', []))})
"""
        for feature in analysis.get('missing_features', []):
            markdown += f"\n### {feature['feature']} ({feature['severity']})\n"
            markdown += f"- **Issue**: {feature['reason']}\n"
            markdown += f"- **Recommended Test**: {feature['recommended_test_type']}\n"
        
        markdown += "\n## Compliance Gaps\n"
        for gap in analysis.get('compliance_gaps', []):
            markdown += f"\n### {gap['standard']}\n"
            markdown += f"- **Gap**: {gap['gap']}\n"
            markdown += f"- **Risk**: {gap['risk']}\n"
        
        markdown += "\n## Recommendations\n"
        for rec in analysis.get('recommendations', []):
            markdown += f"- {rec}\n"
        
        markdown += "\n## Priority Actions\n"
        for action in analysis.get('priority_actions', []):
            markdown += f"- **{action['priority']}**: {action['action']}\n"
        
        return markdown
    
    else:
        return "Unsupported format"


# Fix import
from datetime import datetime

