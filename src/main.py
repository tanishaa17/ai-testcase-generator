import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

def configure_ai():
    """Configures the Gemini AI with the API key."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key or api_key == 'YOUR_API_KEY_HERE':
        raise ValueError("GEMINI_API_KEY not found or is a placeholder. Check your .env file.")
    genai.configure(api_key=api_key)

def read_requirement_file(file_path):
    """Reads the content of the requirement file."""
    try:
        with open(file_path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Error: Requirement file not found at {file_path}")
    except Exception as e:
        raise Exception(f"An error occurred while reading the file: {e}")

def generate_test_cases(requirement_text):
    """Generates test cases using the Gemini AI."""
    prompt = (
        "You are an expert QA Engineer specializing in healthcare software compliance and testing.\n"
        "Your task is to analyze the provided software requirement and generate a comprehensive set of test cases.\n\n"
        "The output must be in Gherkin format.\n"
        "The test cases should cover:\n"
        "1.  Positive scenarios (happy paths).\n"
        "2.  Negative scenarios (error conditions, invalid inputs).\n"
        "3.  Security aspects mentioned in the requirement (e.g., masking sensitive data).\n\n"
        "Here is the requirement:\n"
        "---\n"
        "{requirement}\n"
        "---\n"
    )
    model = genai.GenerativeModel('gemini-1.5-flash')
    full_prompt = prompt.format(requirement=requirement_text)
    print("Sending requirement to Gemini AI...")
    response = model.generate_content(full_prompt)
    print("...Response received.")
    return response.text

def save_output_to_file(content, file_path):
    """Saves the given content to a file, creating the directory if needed."""
    try:
        output_dir = os.path.dirname(file_path)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"\nSuccessfully saved test cases to: {file_path}")
    except Exception as e:
        raise Exception(f"An error occurred while saving the file: {e}")

# --- Main Execution ---
if __name__ == "__main__":
    try:
        configure_ai()
        print("Configuration successful.")
        
        input_file_path = 'inputs/login_requirement.txt'
        requirement_text = read_requirement_file(input_file_path)
        
        print("\n--- Generating Test Cases ---")
        generated_tests = generate_test_cases(requirement_text)
        
        # Define the output file path and save the content
        output_file_path = 'outputs/generated_tests.feature'
        save_output_to_file(generated_tests, output_file_path)

    except Exception as e:
        print(f"An error occurred during execution: {e}")