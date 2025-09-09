from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def create_pdf(file_path, text):
    """Creates a simple PDF document with the given text."""
    try:
        c = canvas.Canvas(file_path, pagesize=letter)
        width, height = letter
        text_object = c.beginText(72, height - 72)
        text_object.setFont("Helvetica", 10)
        for line in text.split('\n'):
            text_object.textLine(line)
        c.drawText(text_object)
        c.save()
        print(f"Successfully created PDF: {file_path}")
    except ImportError:
        print("Error: The 'reportlab' library is not installed.")
        print("Please install it by running: pip install reportlab")
        exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        exit(1)

if __name__ == "__main__":
    output_path = "inputs/sample_requirement.pdf"
    requirement_text = (
        "Feature: Patient Record Search\n\n"
        "  As a healthcare professional, I need to be able to search for patient records "
        "using their unique patient ID.\n\n"
        "  Scenario: Find an existing patient\n"
        "    Given I am on the patient search page\n"
        "    When I enter a valid patient ID\n"
        "    And I click the 'Search' button\n"
        "    Then the patient's record should be displayed.\n\n"
        "  Scenario: Patient not found\n"
        "    Given I am on the patient search page\n"
        "    When I enter an invalid or non-existent patient ID\n"
        "    And I click the 'Search' button\n"
        "    Then a 'Patient Not Found' error message should be displayed."
    )
    create_pdf(output_path, requirement_text)
