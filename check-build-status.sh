#!/bin/bash
# LINESETU APK Build Status Checker
export EXPO_TOKEN=mZWZ7mzpGphxeNJrr7TeCFJjHrQEovVCoELC-4e4

echo "=========================================="
echo "  LINESETU APK Build Status"
echo "=========================================="
echo ""

echo "--- Patient App ---"
cd /app/artifacts/patient-app
eas build:list --platform android --limit 1 --non-interactive 2>&1 | grep -E "Status|Application Archive|Logs"
echo ""

echo "--- Doctor App ---"
cd /app/artifacts/doctor-app
eas build:list --platform android --limit 1 --non-interactive 2>&1 | grep -E "Status|Application Archive|Logs"
echo ""
echo "=========================================="
