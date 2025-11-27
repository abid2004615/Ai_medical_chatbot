# Files to remove
$filesToRemove = @(
    "CHAT_HISTORY_FEATURES.md",
    "CHAT_UI_FIXES.md",
    "DISCLAIMER_UPDATE_SUMMARY.md",
    "DOCTOR_PERSONA_EXAMPLES.md",
    "DOCTOR_PERSONA_FIX.md",
    "DOCTOR_PERSONA_IMPLEMENTATION.md",
    "DOCTOR_PERSONA_QUICK_REF.md",
    "IMPLEMENTATION_COMPLETE.md",
    "IMPLEMENTATION_SUMMARY.md",
    "LIMITATIONS_AND_IMPROVEMENTS.md",
    "MIGRATION_GUIDE.md",
    "PROJECT_DIARY_24_WEEKS.md",
    "QUICK_REFERENCE.md",
    "QUICK_START_GUIDE.md",
    "README_SAFETY_FEATURES.md",
    "SAFETY_FEATURES_QUICK_REFERENCE.md",
    "SYMPTOM_REPLY_FLOW.md",
    "SYSTEM_ARCHITECTURE.md",
    "TROUBLESHOOTING_REPLIES.md",
    "medichat_ieee_paper.tex",
    "test_api.py"
)

# Directories to remove
$dirsToRemove = @(
    ".kiro",
    "node_modules",
    "backend/__pycache__",
    "backend/venv"
)

# Remove files
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "Removing file: $file"
        Remove-Item -Path $file -Force
    }
}

# Remove directories
foreach ($dir in $dirsToRemove) {
    if (Test-Path $dir) {
        Write-Host "Removing directory: $dir"
        Remove-Item -Path $dir -Recurse -Force
    }
}

Write-Host "Cleanup completed. A backup of the database has been created in the 'backup' directory."
