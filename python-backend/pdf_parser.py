"""
PDF parsing utility for extracting text from resume PDFs.
Uses PyPDF2 for reliable text extraction.
"""

from PyPDF2 import PdfReader
import io


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from a PDF file using PyPDF2.
    
    Args:
        pdf_bytes: PDF file as bytes
    
    Returns:
        Extracted text as string
    
    Raises:
        Exception: If PDF extraction fails
    """
    try:
        # Open PDF from bytes
        pdf_stream = io.BytesIO(pdf_bytes)
        pdf_reader = PdfReader(pdf_stream)
        
        text = ""
        
        # Extract text from all pages
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()
            text += "\n"  # Add page separator
        
        # Clean up the text
        text = text.strip()
        
        # Remove excessive whitespace
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        clean_text = '\n'.join(lines)
        
        return clean_text
        
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")


def validate_pdf(pdf_bytes: bytes) -> bool:
    """
    Validate if the provided bytes represent a valid PDF file.
    
    Args:
        pdf_bytes: PDF file as bytes
    
    Returns:
        True if valid PDF, False otherwise
    """
    try:
        pdf_stream = io.BytesIO(pdf_bytes)
        pdf_reader = PdfReader(pdf_stream)
        
        # Check if document has at least one page
        has_pages = len(pdf_reader.pages) > 0
        
        return has_pages
        
    except:
        return False


def get_pdf_info(pdf_bytes: bytes) -> dict:
    """
    Get basic information about the PDF.
    
    Args:
        pdf_bytes: PDF file as bytes
    
    Returns:
        Dictionary with PDF information
    """
    try:
        pdf_stream = io.BytesIO(pdf_bytes)
        pdf_reader = PdfReader(pdf_stream)
        
        info = {
            "page_count": len(pdf_reader.pages),
            "metadata": dict(pdf_reader.metadata) if pdf_reader.metadata else {},
            "is_encrypted": pdf_reader.is_encrypted,
        }
        
        return info
        
    except Exception as e:
        return {"error": str(e)}
