import argparse
import os

# Import the shared logic
from core.logic import (
    configure_ai,
    configure_jira,
    read_requirement_file,
    generate_test_cases,
    save_output_to_file,
    create_jira_issues
)

def main():
    """Wraps the main execution logic for the command-line interface."""
    parser = argparse.ArgumentParser(description="Generate AI-powered test cases from requirement files.")
    parser.add_argument("-i", "--input", required=True, help="Path to the input requirement file.")
    parser.add_argument("-o", "--output", required=True, help="Path for the generated output Gherkin file.")
    parser.add_argument("--domain", default="healthcare software", help="The industry domain for the requirements (e.g., 'finance', 'e-commerce').")
    parser.add_argument("--jira", action='store_true', help="If set, create issues in Jira for each test scenario.")
    parser.add_argument("--parent-issue", help="Jira key of the parent issue for sub-tasks.")
    args = parser.parse_args()

    try:
        # --- Configuration ---
        configure_ai()
        print("AI configuration successful.")

        # --- File Reading ---
        print(f"Reading requirement from: {args.input}")
        requirement_text = read_requirement_file(args.input)
        
        # --- Test Case Generation ---
        print("\n--- Generating Test Cases ---")
        # Note: The core generate_test_cases function returns a dictionary.
        # The CLI tool previously worked with raw text, so we'll adapt.
        generated_data = generate_test_cases(requirement_text, args.domain)

        if 'error' in generated_data:
            raise Exception(f"Failed to generate test cases: {generated_data['error']}")

        # Extract the Gherkin text for saving and Jira processing
        gherkin_texts = [tc['gherkin_feature'] for tc in generated_data.get('test_cases', [])]
        full_gherkin_output = "\n\n".join(gherkin_texts)

        if not full_gherkin_output:
            print("Warning: AI did not return any test cases.")
            return

        # --- File Output ---
        save_output_to_file(full_gherkin_output, args.output)
        print(f"\nSuccessfully saved test cases to: {args.output}")

        # --- Jira Integration ---
        if args.jira:
            print("\n--- Creating Jira Issues ---")
            jira_client = configure_jira()
            print("Jira connection successful.")
            create_jira_issues(jira_client, full_gherkin_output, args.parent_issue)

    except Exception as e:
        print(f"\nAn error occurred during execution: {e}")


if __name__ == "__main__":
    main()
