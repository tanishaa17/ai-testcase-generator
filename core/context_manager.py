"""
Context Management Module
Handles context creation, storage, gathering, and retrieval for intelligent test case generation.
Implements a scalable, memory-efficient context management system.
"""

import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib

class ContextManager:
    """
    Manages context storage, retrieval, and versioning for test case generation.
    Supports both in-memory and persistent storage for scalability.
    """
    
    def __init__(self, storage_path: str = "context_storage"):
        self.storage_path = storage_path
        os.makedirs(storage_path, exist_ok=True)
        self.context_cache = {}  # In-memory cache for quick access
    
    def create_context(self, requirement_text: str, domain: str, 
                      metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Create and store context from requirements and design documentation.
        
        Args:
            requirement_text: The requirement content
            domain: Domain context (e.g., "healthcare software")
            metadata: Additional metadata (design docs, mockups references, etc.)
        
        Returns:
            context_id: Unique identifier for the stored context
        """
        # Generate context ID from content hash
        content_hash = hashlib.md5(f"{requirement_text}{domain}".encode()).hexdigest()
        context_id = f"ctx_{content_hash}_{int(datetime.now().timestamp())}"
        
        context_data = {
            "context_id": context_id,
            "requirement_text": requirement_text,
            "domain": domain,
            "metadata": metadata or {},
            "created_at": datetime.now().isoformat(),
            "version": 1
        }
        
        # Store in memory cache
        self.context_cache[context_id] = context_data
        
        # Persist to storage
        self._save_context(context_id, context_data)
        
        return context_id
    
    def build_context(self, context_id: str, additional_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build and enhance context with additional information (feature updates, feedback, etc.).
        Implements the "Build and Store Context" step from the architecture.
        """
        existing_context = self.get_context(context_id)
        if not existing_context:
            raise ValueError(f"Context {context_id} not found")
        
        # Enhance context with additional information
        if "updates" not in existing_context:
            existing_context["updates"] = []
        
        existing_context["updates"].append({
            "timestamp": datetime.now().isoformat(),
            "info": additional_info,
            "version": existing_context["version"] + 1
        })
        
        existing_context["version"] += 1
        
        # Update cache and storage
        self.context_cache[context_id] = existing_context
        self._save_context(context_id, existing_context)
        
        return existing_context
    
    def get_context(self, context_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve context by ID, with caching for performance."""
        if context_id in self.context_cache:
            return self.context_cache[context_id]
        
        # Load from storage if not in cache
        context_file = os.path.join(self.storage_path, f"{context_id}.json")
        if os.path.exists(context_file):
            with open(context_file, 'r', encoding='utf-8') as f:
                context_data = json.load(f)
                self.context_cache[context_id] = context_data
                return context_data
        
        return None
    
    def add_feedback(self, context_id: str, feedback: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add user feedback to context for continuous improvement.
        Implements feedback loop from architecture diagram.
        """
        context = self.get_context(context_id)
        if not context:
            raise ValueError(f"Context {context_id} not found")
        
        if "feedback" not in context:
            context["feedback"] = []
        
        feedback_entry = {
            "timestamp": datetime.now().isoformat(),
            "feedback": feedback,
            "processed": False
        }
        
        context["feedback"].append(feedback_entry)
        
        # Update context
        self.context_cache[context_id] = context
        self._save_context(context_id, context)
        
        return context
    
    def list_contexts(self) -> List[Dict[str, Any]]:
        """List all available contexts."""
        contexts = []
        for filename in os.listdir(self.storage_path):
            if filename.endswith('.json'):
                context_id = filename.replace('.json', '')
                context = self.get_context(context_id)
                if context:
                    contexts.append({
                        "context_id": context_id,
                        "domain": context.get("domain"),
                        "created_at": context.get("created_at"),
                        "version": context.get("version")
                    })
        return contexts
    
    def _save_context(self, context_id: str, context_data: Dict[str, Any]):
        """Internal method to persist context to storage."""
        context_file = os.path.join(self.storage_path, f"{context_id}.json")
        with open(context_file, 'w', encoding='utf-8') as f:
            json.dump(context_data, f, indent=2)


# Global context manager instance
_context_manager = None

def get_context_manager() -> ContextManager:
    """Factory function to get global context manager instance."""
    global _context_manager
    if _context_manager is None:
        _context_manager = ContextManager()
    return _context_manager

