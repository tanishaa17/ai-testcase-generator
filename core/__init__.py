"""
Core modules for AI Test Case Generator.
Provides context management, feature analysis, and export capabilities.
"""

from .logic import (
    configure_ai,
    read_requirement_file,
    generate_test_cases,
    configure_jira,
    create_jira_issues,
    configure_azure_devops,
    create_azure_devops_work_items,
    configure_polarion,
    create_polarion_test_cases,
    generate_traceability_matrix
)

from .context_manager import (
    ContextManager,
    get_context_manager
)

from .feature_analyzer import (
    analyze_feature_gaps,
    export_analysis_report
)

from .export_manager import ExportManager

__all__ = [
    "configure_ai",
    "read_requirement_file",
    "generate_test_cases",
    "configure_jira",
    "create_jira_issues",
    "configure_azure_devops",
    "create_azure_devops_work_items",
    "configure_polarion",
    "create_polarion_test_cases",
    "generate_traceability_matrix",
    "ContextManager",
    "get_context_manager",
    "analyze_feature_gaps",
    "export_analysis_report",
    "ExportManager"
]

