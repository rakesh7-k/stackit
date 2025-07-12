from django.shortcuts import render
from django.http import HttpResponse
import os

def serve_frontend(request, page_name='index'):
    """
    Serve frontend HTML files using Django's template engine
    """
    # Map URL paths to HTML files
    page_mapping = {
        'index': 'index.html',
        'dashboard': 'dashboard.html',
        'community': 'community.html',
        'question': 'question.html',
        'journal': 'journal.html',
        'profile': 'profile.html',
    }
    html_file = page_mapping.get(page_name, 'index.html')
    return render(request, html_file) 